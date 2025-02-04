import { NextResponse } from "next/server";
import { registerUser, loginUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log("Received Request Body:", body); // ✅ Debugging Line

        const { action, username, email, password, healthIssues, allergies } = body;

        if (action === "register") {
            if (!username || !email || !password) {
                return NextResponse.json(
                    { error: "Username, email, and password are required" },
                    { status: 400 }
                );
            }

            try {
                const user = await registerUser(
                    username, 
                    email, 
                    password, 
                    healthIssues || [],
                    allergies || []
                );
                
                if ("error" in user) {
                    throw new Error(user.error); // ❌ Instead of returning an object, throw an error
                }
        
                return NextResponse.json({ message: "User registered", user });
            } catch (error: any) {
                return NextResponse.json({ error: error.message }, { status: 400 }); // ✅ Correctly return 400
            }
        } else if (action === "login") {
            console.log("Login Attempt:", email, password);
            
            try {
                const token = await loginUser(email, password);
                console.log("Login Token:", token);
        
                return NextResponse.json({ token });
            } catch (error) {
                return NextResponse.json({ error: error.message }, { status: 401 }); // Correctly return 401
            }
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("POST /api/auth Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
