/*
  Errors displayed on the web page with optional splash ASCII art.
  APIs return { code, message }; art is resolved client-side from ERRORS.
*/

export type ErrorCode = "ROOM_NOT_FOUND" | "PAGE_NOT_FOUND" | "FORBIDDEN" | "NOT_HOST";

export type DisplayError = {
  code: ErrorCode;
  message: string;
};

export const ERRORS: Record<ErrorCode, { message: string; art?: string }> = {
  ROOM_NOT_FOUND: {
    message: "Party's over. Try another code.",
    art: `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⣴⠶⠶⠶⠶⠶⠶⢶⣶⣤⣄⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣶⡿⠟⠋⠉⠠⣤⣽⣷⣷⣆⠀⠀⠀⠉⠉⠛⠻⣷⣦⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣠⣶⢟⣿⠇⠀⠀⠀⣰⣿⠟⠉⠈⠉⠻⢿⣶⣶⣧⣤⣄⡀⠀⣉⣿⣿⣿⣶⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⣾⣛⡳⠙⢁⣀⣀⣠⣶⣿⡇⠀⠀⠀⠀⠀⠀⠘⣿⣮⡉⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢀⣾⣿⡿⠋⢉⣾⡿⠛⠛⠛⢿⣿⣷⡄⠀⠀⠀⠀⠀⠀⠈⠻⠿⠿⠿⣿⣿⣿⣟⢿⣿⣿⣿⣿⣿⣮⡉⠉⠛⠲⢤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣰⣿⡿⠛⠂⢀⣸⣿⠀⠀⠀⠀⠀⢻⣿⣿⣦⡀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠿⣿⣿⡟⢿⣿⣿⣿⣿⣆⠀⠀⠀⠹⣦⡀⠀⠀⠀⠀⠀⠀⠀
⢀⣿⠇⠀⣀⣠⣾⣿⣿⣆⠀⠀⠀⠀⠀⠹⣿⣽⣿⠿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣷⡀⡿⣿⣿⣿⣿⣧⠀⠀⠀⠈⠻⡆⠀⠀⠀⠀⠀⠀
⢸⣿⢸⠸⣱⣿⠏⢻⠈⢿⣦⡀⠀⠀⠀⠀⠸⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣄⡀⢹⣿⣄⠙⢿⣿⣿⣿⡇⠀⠀⠀⠀⢿⠀⠀⠀⠀⠀⠀
⢸⣿⠈⢠⣿⡏⠀⠘⡇⠀⠙⠿⣷⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⡇⠀⠙⣿⣆⢸⣿⣿⠿⠿⣿⣦⡀⠀⢻⢤⢤⣀⠀⠀⠀
⠘⣿⡄⢀⣿⡇⠀⠀⠹⣄⣤⣶⣦⣽⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⢸⣿⣾⣿⠏⠀⠀⠈⢿⣷⡀⠀⠀⠀⠈⢻⡆⠀
⠀⢿⣇⣘⢻⣷⠀⠀⣰⣿⣿⡇⠉⠻⢿⣷⣄⠀⠀⠀⠀⠀⣠⣤⣄⠀⠀⠀⠰⣾⠷⠗⠀⠀⠀⠀⢸⣿⡿⠁⠀⠀⠀⠀⠀⢻⣧⠀⠀⠀⠀⢸⡇⠀
⠀⠘⣿⣿⣞⢿⣶⣶⣿⣿⣿⣿⣶⡀⠀⠙⢿⣦⡀⠀⠀⠀⠙⢿⡿⠃⠀⠀⠈⠉⠀⠀⠀⠀⠀⠀⠘⠋⠁⠀⠀⠀⠀⠀⠀⣼⡿⠀⠀⢀⣴⠏⠀⠀
⠀⠀⠸⣿⣾⡀⢶⣐⡀⢀⣿⣿⣿⣿⣦⠀⠀⠙⢿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀⠀⠘⢷⣄⣀⡀
⠀⠀⠀⠈⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⢿⣿⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣶⣷⣶⣶⣮⣍⡉⠉⠀
⠀⠀⠀⠀⠀⠀⠨⡙⢿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠹⣿⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠀⠀⠉⠛⢿⣷⡀
⠀⠀⠀⠀⠀⠀⠀⠘⣜⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠹⣿⣷⣶⡗⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣧
⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣦⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡿
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡈⠻⣿⣿⣿⣿⣿⣿⣿⡿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⠁
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⣄⠈⠛⠿⣿⣿⠟⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣆⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢦⠀⢠⣿⠃⠀⠀⠀⠀⠀⠀⠀⢀⣄⠀⠀⠀⠀⠀⠀⠰⣦⣤⣄⡀⠀⠀⠀⣠⣿⣿⣶⣶⣶⣶⠾⠿⠋⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀  ⠀⠀⠀⠓⢸⣿⠀⠀⠀⠀⠀⠀⠀⣠⣿⠏⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣦⣴⣿⠟⠉⠀⠀⠀⠠⣴⠟⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⠀⠀⠸⣿⣤⡀⠀⢀⣀⣴⣾⠿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣅⠀⠀⠀⣀⣤⠞⠉⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠛⠛⠛⠋⠁⠀⠀⢻⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠈⠙⠂⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣷⣄⠀⠀⠀⠀⠀⠀⢀⣼⡏⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠻⢷⣶⣶⣶⣶⡾⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`,
  },
  FORBIDDEN: {
    message: "You don't have permission to do that.",
  },
  NOT_HOST: {
    message: "Only the room host can open the player.",
  },
  PAGE_NOT_FOUND: {
    message: "Page not found. Check the URL and try again.",
    art: `
    ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡶⠟⠋⠉⣉⡉⠉⠙⠳⣦⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣤⣤⣤⣤⣀⣀⡾⠋⠀⣠⡾⠛⠛⠻⣷⡀⠀⠈⢳⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡴⠶⠖⠿⠋⠉⠁⠀⠀⠀⠀⠀⠉⠉⠛⢷⣶⣿⣤⣤⣀⠀⠘⠀⠀⠀⢸⡇⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⠞⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠈⠙⢷⣄⠀⠀⣠⣾⣇⡀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣀⣤⣤⣴⠾⠛⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⡋⠀⠈⠻⣦⡀⠀⠀⠀
⠀⢀⣴⠾⠋⠉⠁⠀⢀⣀⣀⣠⡾⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢷⡀⠀⠀⠀⠀⠈⠙⢷⣄⠀⠈⢿⡶⣤⡀
⢠⡾⠁⠀⠀⠀⠀⠀⠈⠀⢸⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣼⡷⠦⢤⡄⠀⠀⠀⠀⠙⢷⡄⠈⣧⠈⣿
⢸⠁⠀⠀⠀⠀⠀⠀⠀⢀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡾⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⣋⣰⠟
⢸⣆⠀⠀⠀⠀⠀⠀⠀⢸⣇⢀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣷⠟⠁⠀
⠀⠙⠷⣤⣄⣀⣀⣀⣀⣀⣻⣮⡉⡉⠉⠀⠀⠀⠀⠀⠀⠀⠛⠲⠶⣤⡄⢸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡾⠃⠀⠀⠀
⠀⠀⠀⠀⠈⠉⠉⠉⠉⠉⠉⠈⠉⠛⠒⠒⠷⠴⠶⠤⠶⠤⠤⣤⣦⣤⣤⣤⣿⣦⣀⣀⣀⠀⢀⣀⣀⣀⣀⣤⣤⠶⠛⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠉⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀
    `,
  },
};

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public status = 404
  ) {
    super(ERRORS[code].message);
    this.name = "AppError";
  }
}

export function errorPayload(code: ErrorCode): DisplayError {
  return { code, message: ERRORS[code].message };
}

export function appErrorResponse(err: AppError) {
  return Response.json(errorPayload(err.code), { status: err.status });
}

export async function readApiError(res: Response): Promise<DisplayError | null> {
  const body = await res.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    typeof body.code === "string" &&
    typeof body.message === "string" &&
    body.code in ERRORS
  ) {
    return { code: body.code as ErrorCode, message: body.message };
  }
  return null;
}
