'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import Link from 'next/link';
import {
  LogOut,
  User as UserIcon,
  BookOpen,
  Milestone,
  Train,
  Rss,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DashboardPage = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    setUser({
      uid: '123',
      displayName: 'Test User',
      email: 'test@example.com',
    } as User);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Učitavanje...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Dobrodošli, {user.displayName || user.email}
            </span>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <UserIcon size={16} />
              <span>Profil</span>
            </Link>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut size={16} />
              <span>Odjavi se</span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className=" transition-shadow">
            <Link href="/block/sprachenweg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-green-600" />
                  Sprachenweg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Glavni kurs sa lekcijama.
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className=" transition-shadow">
            <Link href="/sprachenstadt">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Milestone className="text-blue-600" />
                  Sprachenstadt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Grad jezika - vježbe i zadaci.
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className=" transition-shadow">
            <Link href="/sprachenzug">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="text-yellow-600" />
                  Sprachenzug
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Voz znanja - brze vježbe.
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className=" transition-shadow">
            <Link href="/sprachgarten">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rss className="text-red-600" />
                  Sprachengarten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Vaš lični vrt riječi.</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
