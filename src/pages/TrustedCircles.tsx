import React from 'react';
import { Users } from 'lucide-react';
import type { TrustedCircle } from '../types';

const TrustedCircles = () => {
  const circles: TrustedCircle[] = [
    {
      id: '1',
      name: "Sarah's School Group",
      members: [
        { id: '1', fullName: 'John Smith', email: 'john@example.com' },
        { id: '2', fullName: 'Emma Davis', email: 'emma@example.com' },
      ],
      pendingInvites: ['mary@example.com'],
    },
    {
      id: '2',
      name: 'Soccer Team Parents',
      members: [
        { id: '1', fullName: 'John Smith', email: 'john@example.com' },
        { id: '3', fullName: 'Mike Johnson', email: 'mike@example.com' },
      ],
      pendingInvites: [],
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trusted Circles</h1>
          <p className="text-gray-600">Manage your trusted networks</p>
        </div>
        <button className="bg-[#004b6e] text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Users className="w-4 h-4" />
          New Circle
        </button>
      </header>

      <div className="space-y-4">
        {circles.map((circle) => (
          <div key={circle.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{circle.name}</h3>
              <span className="text-sm text-gray-500">{circle.members.length} members</span>
            </div>
            
            <div className="space-y-3">
              {circle.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#004b6e] text-white flex items-center justify-center">
                    {member.fullName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{member.fullName}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {circle.pendingInvites.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Pending Invites</p>
                {circle.pendingInvites.map((email) => (
                  <div key={email} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ff7e47]" />
                    {email}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustedCircles;