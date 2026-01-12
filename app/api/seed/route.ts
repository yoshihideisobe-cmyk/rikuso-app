import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    const count = await User.countDocuments();
    if (count > 0) {
        return NextResponse.json({ message: 'Database already seeded' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash('1234', salt); // Default PIN: 1234

    const users = [
        {
            empId: 'D001',
            pin: hashedPin,
            name: 'Driver Tanaka',
            role: 'driver',
            subscriptions: ['Route A', 'Tokyo'],
        },
        {
            empId: 'D002',
            pin: hashedPin,
            name: 'Driver Suzuki',
            role: 'driver',
            subscriptions: ['Route B', 'Osaka'],
        },
        {
            empId: 'A001',
            pin: hashedPin,
            name: 'Office Admin Sato',
            role: 'office_admin',
        },
        {
            empId: 'S001',
            pin: hashedPin,
            name: 'Safety Admin Takahashi',
            role: 'safety_admin',
        },
    ];

    await User.insertMany(users);

    return NextResponse.json({ message: 'Database seeded successfully', users });
}
