import { NextResponse } from "next/server";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";

const allowedRoles = ['SUPER_ADMIN', 'TEACHER', 'HR', 'ACCOUNTANT', 'MARKETING_DESIGN', 'SALES'];
const allowedDepartments = ['Support teacher', 'Main teacher', 'Management', 'Sales', 'Boshqaruv', 'Other'];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { name, phone, password, department, status, role } = body;

    const updateData: Record<string, unknown> = {};
    if (role && !allowedRoles.includes(role)) return NextResponse.json({ error: 'Rol noto‘g‘ri tanlangan' }, { status: 400 });
    if (department && !allowedDepartments.includes(department)) return NextResponse.json({ error: 'Bo‘lim noto‘g‘ri tanlangan' }, { status: 400 });
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    console.log("UPDATING USER:", id, updateData);

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedUser) {
      console.log("USER NOT FOUND IN DB:", id);
      return NextResponse.json({ error: "Xodim topilmadi" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PUT USER ERROR:", error);
    return NextResponse.json({ error: "Tahrirlashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Xodim o'chirildi" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
