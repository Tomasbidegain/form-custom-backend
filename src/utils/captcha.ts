export interface TurnstileVerificationResult {
  success: boolean;
  errorCodes?: string[];
}

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstileToken(
  token: string,
  ipAddress: string | null,
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return { success: false, errorCodes: ["missing_secret"] };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: ipAddress,
      }),
    });

    const data = (await response.json()) as TurnstileResponse;

    return {
      success: data.success,
      errorCodes: data["error-codes"],
    };
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return { success: false, errorCodes: ["verification_error"] };
  }
}
