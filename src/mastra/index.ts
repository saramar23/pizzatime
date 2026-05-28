import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { restaurantAgent } from './agents/restaurant-agent';

export const mastra = new Mastra({
  agents: { restaurantAgent },
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});