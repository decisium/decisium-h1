import { NextResponse }
from "next/server";

export async function POST(
  request: Request
) {

  const body =
    await request.json();

  const {
    username,
    password,
  } = body;

  const validUsername =
    process.env
      .HOST_USERNAME;

  const validPassword =
    process.env
      .HOST_PASSWORD;

  if (
    username ===
      validUsername &&
    password ===
      validPassword
  ) {

    return NextResponse.json(
      {
        success: true,
      }
    );

  }

  return NextResponse.json(
    {
      success: false,
    },
    {
      status: 401,
    }
  );

}