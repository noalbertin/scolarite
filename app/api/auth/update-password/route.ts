import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const token = request.headers.get("Authorization")

        const response = await fetch(`${API_URL}/api/auth/update-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: token || ""
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
