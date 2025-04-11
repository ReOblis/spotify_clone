from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Tạo user với mật khẩu được mã hóa
        password = validated_data.pop('password', None)  # Đảm bảo mật khẩu được tách riêng
        user = User.objects.create_user(**validated_data)  # Sử dụng `create_user` để mã hóa mật khẩu
        if password:
            user.set_password(password)
            user.save()
        return user