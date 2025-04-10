import { Request, Response, NextFunction } from 'express';
import { ReturnModelType } from '@typegoose/typegoose';

import { ResourceList } from '@/util/data';
import { escapeRegExp } from '@/util/regex';

interface IndexQuery {
  name?: { $regex: RegExp };
}

class SimpleController {
  Schema: ReturnModelType<any>;

  constructor(Schema: ReturnModelType<any>) {
    this.Schema = Schema;
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const searchQueries: IndexQuery = {};
      if (req.query.name !== undefined) {
        searchQueries.name = { $regex: new RegExp(escapeRegExp(req.query.name as string), 'i') };
      }

      const data = await this.Schema.find(searchQueries)
        .select({ index: 1, name: 1, url: 1, _id: 0 })
        .sort({ index: 'asc' })
        .exec();

      return res.status(200).json(ResourceList(data));
    } catch (err) {
      next(err);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.Schema.findOne({ index: req.params.index });
      if (!data) return next();
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default SimpleController;
