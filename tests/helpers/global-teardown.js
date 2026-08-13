import { detener } from './preview.js';

export default async function globalTeardown() {
    await detener();
}
