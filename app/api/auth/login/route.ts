import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.json();
  const email = formData.email;
  const password = formData.password;

  // Kiểm tra dữ liệu đầu vào
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email và mật khẩu không được để trống" },
      { status: 400 }
    );
  }

  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // Đăng nhập với Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase login error:", error);
      let errorMessage = "Đăng nhập thất bại";

      switch (error.message) {
        case "Invalid login credentials":
          errorMessage = "Email hoặc mật khẩu không chính xác";
          break;
        case "Email not confirmed":
          errorMessage = "Vui lòng xác nhận email trước khi đăng nhập";
          break;
        case "Invalid email":
          errorMessage = "Email không hợp lệ";
          break;
        default:
          errorMessage = error.message;
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Lấy thông tin user từ database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        username: true,
        email: true,
        fullName: true,
        currentLevel: true,
        totalPoints: true,
        streakDays: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại trong hệ thống" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        user: {
          ...data.user,
          ...user, // Kết hợp thông tin từ Supabase và database
        },
        session: data.session,
      },
      {
        status: 200,
        headers: {
          Location: `${requestUrl.origin}/dashboard`,
          "Set-Cookie": cookieStore
            .getAll()
            .map((cookie) => cookie.value)
            .join("; "),
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
