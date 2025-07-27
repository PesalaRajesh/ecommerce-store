from django.urls import path
from .views import CartItemListCreateAPIView, CartItemDetailAPIView, OrderCreateAPIView

from .views import CreateCheckoutSessionView
from .views import StripeWebhookView

from .views import OrderHistoryAPIView

urlpatterns = [
    path('cart/', CartItemListCreateAPIView.as_view(), name='cart-list-create'),
    path('cart/<int:pk>/', CartItemDetailAPIView.as_view(), name='cart-detail'),
    path('orders/', OrderCreateAPIView.as_view(), name='order-create'),
]


urlpatterns += [
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='checkout-session'),
]


urlpatterns += [
    path("stripe/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]

urlpatterns += [
    path('orders/history/', OrderHistoryAPIView.as_view(), name='order-history'),
]
