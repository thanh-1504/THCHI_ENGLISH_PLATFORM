import * as bcrypt from 'bcrypt';
export class HashingService {
  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }
  comparePassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }
}
