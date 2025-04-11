from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError



User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Xử lý kiểm tra nếu email hoặc username đã tồn tại
    email = request.data.get('email')
    username = request.data.get('username')

    if User.objects.filter(email=email).exists():
        raise ValidationError("Email đã được sử dụng.")
    if User.objects.filter(username=username).exists():
        raise ValidationError("Tên người dùng đã tồn tại.")

    # Kiểm tra mật khẩu mạnh
    password = request.data.get('password')
    if password and len(password) < 8:
        raise ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")

    # Sử dụng serializer để tạo user
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Tạo token cho user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response(
            {'token': token.key, 'user': serializer.data}, 
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')  # Lấy email từ request
    password = request.data.get('password')
    
    # Tìm người dùng bằng email
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

    # Kiểm tra mật khẩu của người dùng
    if user.check_password(password):
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': {'id': user.id, 'email': user.email}}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)