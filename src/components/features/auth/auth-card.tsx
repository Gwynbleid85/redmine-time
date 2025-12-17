import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

interface AuthCardProps {
	onSuccess: () => void;
	defaultTab?: "signin" | "signup";
}

export function AuthCard({ onSuccess, defaultTab = "signin" }: AuthCardProps) {
	return (
		<Card className="w-full max-w-md py-8 px-2">
			<CardHeader>
				<CardTitle>Welcome</CardTitle>
				<CardDescription>
					Sign in to your account or create a new one
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue={defaultTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="signin">Sign In</TabsTrigger>
						<TabsTrigger value="signup">Sign Up</TabsTrigger>
					</TabsList>

					<TabsContent value="signin">
						<SignInForm onSuccess={onSuccess} />
					</TabsContent>

					<TabsContent value="signup">
						<SignUpForm onSuccess={onSuccess} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
