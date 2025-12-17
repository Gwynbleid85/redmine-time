import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";

interface SignUpFormProps {
	onSuccess: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
	const id = useId();
	const nameId = `${id}-name`;
	const emailId = `${id}-email`;
	const passwordId = `${id}-password`;
	const confirmPasswordId = `${id}-confirm-password`;

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		try {
			const result = await signUp.email({
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});

			if (result.error) {
				setError(result.error.message || "Failed to sign up");
				return;
			}

			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to sign up");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor={nameId}>Name</Label>
				<Input
					id={nameId}
					type="text"
					placeholder="Your name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={emailId}>Email</Label>
				<Input
					id={emailId}
					type="email"
					placeholder="you@example.com"
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					required
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={passwordId}>Password</Label>
				<Input
					id={passwordId}
					type="password"
					placeholder="Create a password (min 6 characters)"
					value={formData.password}
					onChange={(e) =>
						setFormData({ ...formData, password: e.target.value })
					}
					required
					minLength={6}
					disabled={isLoading}
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor={confirmPasswordId}>Confirm Password</Label>
				<Input
					id={confirmPasswordId}
					type="password"
					placeholder="Confirm your password"
					value={formData.confirmPassword}
					onChange={(e) =>
						setFormData({
							...formData,
							confirmPassword: e.target.value,
						})
					}
					required
					minLength={6}
					disabled={isLoading}
				/>
			</div>
			{error && (
				<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Creating account..." : "Sign Up"}
			</Button>
		</form>
	);
}
