import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12 lg:p-24 bg-secondary">
      <div className="w-full max-w-2xl">
        <FeedbackForm />
      </div>
    </main>
  );
}
