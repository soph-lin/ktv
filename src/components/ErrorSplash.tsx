import { ERRORS, type DisplayError } from "@/lib/errors";

export default function ErrorSplash({ error }: { error: DisplayError }) {
  const art = ERRORS[error.code]?.art;

  return (
    <div className="flex w-fit flex-col items-center gap-4 text-center">
      <p>{error.message}</p>
      {art && (
        <pre className="w-fit font-mono whitespace-pre text-[0.45rem] leading-none opacity-60">
          {art}
        </pre>
      )}
    </div>
  );
}
