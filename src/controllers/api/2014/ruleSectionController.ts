import { Request, Response, NextFunction } from 'express';
import { ResourceList, escapeRegExp, redisClient } from '@/util';

import RuleSection from '@/models/2014/ruleSection';
interface IndexQuery {
  name?: { $regex: RegExp };
  desc?: { $regex: RegExp };
}

export const index = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const searchQueries: IndexQuery = {};
    if (req.query.name !== undefined) {
      searchQueries.name = { $regex: new RegExp(escapeRegExp(req.query.name as string), 'i') };
    }
    if (req.query.desc !== undefined) {
      searchQueries.desc = { $regex: new RegExp(escapeRegExp(req.query.desc as string), 'i') };
    }

    const redisKey = req.originalUrl;
    const data = await redisClient.get(redisKey);

    if (data) {
      res.status(200).json(JSON.parse(data));
    } else {
      const data = await RuleSection.find(searchQueries)
        .select({ index: 1, name: 1, url: 1, _id: 0 })
        .sort({ index: 'asc' });
      const jsonData = ResourceList(data);
      redisClient.set(redisKey, JSON.stringify(jsonData));
      return res.status(200).json(jsonData);
    }
  } catch (err) {
    next(err);
  }
};

export const show = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await RuleSection.findOne({ index: req.params.index });
    if (!data) return next();
    return res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};
