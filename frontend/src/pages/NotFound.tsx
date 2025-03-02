import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function NotFound() {
  return (
    <DefaultLayout>
      <div className="text-center">
        <h1 className={title()}>Page not found</h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
      </div>
    </DefaultLayout>
  );
}
