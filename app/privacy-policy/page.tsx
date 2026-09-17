import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/privacy-policy/" },
};

export default function PrivacyPage() {
  return (
    <article className="prose max-w-2xl">
      <h1 className="text-4xl font-semibold">Privacy Policy</h1>
      <p className="mt-4 text-navy/75">
        Carpet And Duct Cleaning in Irvine, CA collects name, phone, email, and address only to schedule service and
        send the texts or emails you request. We do not sell personal information. Call (949) 992-3299 with privacy
        questions.
      </p>
    </article>
  );
}
