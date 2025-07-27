from django.shortcuts import render

from rest_framework import generics, permissions
from .models import CartItem, Order
from .serializers import CartItemSerializer, OrderSerializer

import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from .models import Order, OrderItem
from store.models import Product
from django.contrib.auth.models import User
import json
import requests
import os

from django.core.mail import send_mail

# Make sure user must be authenticated for cart and order actions!

class CartItemListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CartItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

class OrderCreateAPIView(generics.CreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OrderHistoryAPIView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')



stripe.api_key = settings.STRIPE_SECRET_KEY


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = request.data.get("cart", [])
        if not cart:
            return Response({"error": "Cart is empty"}, status=400)

        line_items = []
        for item in cart:
            product = item.get("product")
            quantity = int(item.get("quantity", 1))
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": product["name"]},
                    "unit_amount": int(float(product["price"]) * 100),
                },
                "quantity": quantity,
            })

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url="http://localhost:3000/orders",
            cancel_url="http://localhost:3000/cart",
            metadata={
                "user_id": str(request.user.id),
                "cart": json.dumps(cart),
            },
        )
        return Response({"id": session.id})



stripe.api_key = settings.STRIPE_SECRET_KEY

@method_decorator(csrf_exempt, name="dispatch")
class StripeWebhookView(APIView):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE")
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError:
            return HttpResponse(status=400)
        except stripe.error.SignatureVerificationError:
            return HttpResponse(status=400)

        # Handle checkout.session.completed event
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]

            # Retrieve info saved in metadata at checkout
            user_id = session["metadata"]["user_id"]
            cart_json = session["metadata"].get("cart")
            total_amount = float(session["amount_total"]) / 100.0  # in dollars

            try:
                user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                return HttpResponse(status=400)

            # Create Order
            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                status=Order.OrderStatus.PAID,
            )

            # Parse cart from metadata (if passed)
            if cart_json:
                cart = json.loads(cart_json)
                for item in cart:
                    product_id = item["product"]["id"]
                    quantity = item["quantity"]
                    try:
                        product = Product.objects.get(id=product_id)
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=quantity,
                            unit_price=product.price,
                        )
                    except Product.DoesNotExist:
                        continue

            # Send confirmation email
            self.send_order_email(user.email, order)

            # Send Slack notification
            self.send_slack_notification(order)

        return HttpResponse(status=200)

    def send_order_email(self, user_email, order):
    subject = f"Order Confirmation - Order #{order.id}"
    message = (
        f"Thank you for your purchase!\n"
        f"Order ID: {order.id}\n"
        f"Total: ₹{order.total_amount}\n"
        "We will notify you once your order is shipped."
    )
    send_mail(
        subject,
        message,
        os.getenv("DEFAULT_FROM_EMAIL"),  # from email
        [user_email],
        fail_silently=False,
    )

    def send_slack_notification(self, order):
        slack_token = os.getenv("SLACK_BOT_TOKEN")
        slack_channel = os.getenv("SLACK_CHANNEL_ID")

        if not slack_token or not slack_channel:
            return

        headers = {
            "Authorization": f"Bearer {slack_token}",
            "Content-Type": "application/json",
        }
        data = {
            "channel": slack_channel,
            "text": f":shopping_cart: New order #{order.id} for ₹{order.total_amount} by {order.user.username}",
        }
        requests.post("https://slack.com/api/chat.postMessage", headers=headers, json=data)



