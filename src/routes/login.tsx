import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthCard } from "@/components/features/auth";
import { redirectIfAuthenticated } from "@/lib/auth-utils";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	beforeLoad: redirectIfAuthenticated,
});

function LoginPage() {
	const navigate = useNavigate();

	const handleSuccess = () => {
		navigate({ to: "/calendar" });
	};

	return (
		<div className="flex min-h-full items-center justify-center bg-background p-4">
			<AuthCard onSuccess={handleSuccess} />
		</div>
	);
}
