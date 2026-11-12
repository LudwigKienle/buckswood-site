// GET /api/config – tells the pages whether Premium can be bought yet.
import {configured, json} from './_lib.js';

export function GET() {
  return json({checkout: configured(), price: '€4.99 / month'});
}
