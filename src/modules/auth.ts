import type { AuthStatus } from '../types/auth-status';
import type { ICheckSubscription } from '../types/check-subscription';
import { MusicModule } from '../native-module';

class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   */
  public static async authorize(): Promise<AuthStatus> {
    const status = await MusicModule.authorization();
    return status as AuthStatus;
  }

  /**
   * Checks the user's subscription status for Apple Music via MusicSubscription.current.
   */
  public static async checkSubscription(): Promise<ICheckSubscription> {
    return (await MusicModule.checkSubscription()) as ICheckSubscription;
  }
}

export default Auth;
