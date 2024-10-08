import bcrypt from 'bcryptjs';
import db from './db';

// Define User type
interface User {
  id: number;
  username: string;
  password: string;
}

// Function to get user by email
async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const user = await db('users').where({ username }).first();
    return user || null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    throw new Error('Database query failed');
  }
}

// Function to verify password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Password verification failed');
  }
}

// Function to handle login
export async function handleLogin(username: string, password: string) {
  if (!username || !password) {
    throw new Error('username and password are required');
  }

  try {
    const user = await getUserByUsername(username);
       
    if (user && await verifyPassword(password, user.password)) {
        
      // Return user info excluding the password
      return {
        id: user.id,
        username: user.username,
      };
    }

    return null;
  } catch (error) {
    console.error('Error during login process:', error);
    throw new Error('Login process failed');
  }
}
