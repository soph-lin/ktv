import ErrorSplash from "@/components/ErrorSplash";
import { errorPayload } from "@/lib/errors";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-black p-6 text-white">
      <ErrorSplash error={errorPayload("PAGE_NOT_FOUND")} />
    </main>
  );
}
