import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();
  const { email, password, username, fullName } = formData;

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }],
      },
    });

    if (existingUser) {
      const errorMessage =
        existingUser.email === email
          ? "Email này đã được sử dụng"
          : "Tên đăng nhập này đã tồn tại";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Đăng ký với Supabase (Supabase sẽ tự động hash password)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      let errorMessage = "Đăng ký thất bại";

      switch (signUpError.message) {
        case "User already registered":
          errorMessage = "Email này đã được đăng ký";
          break;
        case "Invalid email":
          errorMessage = "Email không hợp lệ";
          break;
        default:
          errorMessage = signUpError.message;
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Tạo user trong database (sử dụng một placeholder cho passwordHash)
    try {
      await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: "SUPABASE_MANAGED", // Placeholder vì password được quản lý bởi Supabase
          fullName,
          currentLevel: 1,
          totalPoints: 0,
          streakDays: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Có lỗi xảy ra khi tạo tài khoản" },
        { status: 500 }
      );
    }

    // Thông báo thành công và yêu cầu xác nhận email
    return NextResponse.json(
      {
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác nhận tài khoản trước khi đăng nhập.",
        user: authData.user,
        credentials: {
          email,
          password,
        },
      },
      {
        status: 200,
        headers: {
          Location: `${requestUrl.origin}/login`,
        },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
