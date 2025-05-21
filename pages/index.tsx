// pages/index.tsx
import Head from 'next/head';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';
import TodoList from '@/components/TodoList';
import { GetServerSidePropsContext } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import TaskManager from '@/components/TaskManager';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  return {
    props: {
      initialSession: session,
    },
  };
};

const Home = ({ initialSession }: any) => {
  const session = useSession() || initialSession; 
  const supabase = useSupabaseClient();

  return (
    <>
      <Head>
        <title>Todo App</title>
      </Head>
      <div className="w-full h-full bg-gray-300">
        {!session ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="p-6 bg-white rounded shadow">
              <h1 className="text-center text-2xl font-bold mb-4">Login</h1>
              <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} theme="dark" />
            </div>
          </div>
        ) : (
          <div className="container mx-auto p-6">
            <TodoList session={session} />
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) console.error('Logout error:', error.message);
              }}
              className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
            >
              Logout
            </button>
          </div>
        )}
        
      <TaskManager />

      </div>
      
    </>
  );
};

export default Home;
