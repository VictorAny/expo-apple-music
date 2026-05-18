import type { AuthStatus } from '../types/auth-status';
import type { ICheckSubscription } from '../types/check-subscription';
import { MusicModule } from '../native-module';

class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   *
   * On Android, pass a MusicKit **developer JWT** (see Apple’s Android MusicKit docs).
   * You can also set `androidDeveloperToken` in the config plugin instead of passing it here.
   */
  public static async authorize(developerToken?: string): Promise<AuthStatus> {
    // Same arity on iOS and Android — Android reads developerToken; iOS ignores it.
    const status = await MusicModule.authorization(developerToken ?? null);
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
