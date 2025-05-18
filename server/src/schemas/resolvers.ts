import User from "../models/User.js";
import { signToken } from "../services/auth.js";

interface userContext {
    user:{
        username: string | null;
        email: string | null;
        _id: string | null;
    } | null;
}
interface loginArgs {
    email: string;
    password: string;
}
interface addUserArgs {
    username: string;
    email: string;
    password: string;
}


const resolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: userContext) => {
      if (context.user) {
        return await User.findById(context.user._id);
      }
      throw new Error('Not authenticated');
    },
  },
  Mutation: {
    login: async (_parent: any, { email, password } : loginArgs, _context : userContext) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }
      const isValid = await user.isCorrectPassword(password);
      if (!isValid) {
        throw new Error('Invalid password');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (_parent: any, { username, email, password } : addUserArgs, _context : userContext) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (_parent: any, args : any, context: userContext) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $push: { savedBooks: args } },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error('Not authenticated');
    },
    removeBook: async (_parent: any, { bookId } : any, context: userContext) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new Error('Not authenticated');
    },
  },
}
export default resolvers;