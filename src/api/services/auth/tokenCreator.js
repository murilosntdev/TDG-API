import crypto from 'crypto';
import { insertoIntoPasswordResetToken } from '../../../core/models/Auth.js';

export const createResetPasswordToken = async (accountId) => {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const insertData = await insertoIntoPasswordResetToken(accountId, tokenHash);

    if (insertData.dbError) {
        return insertData;
    };

    return token;
}