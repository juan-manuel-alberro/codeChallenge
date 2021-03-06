import mongoose from 'mongoose';
import validate from 'mongoose-validator';

const Schema = mongoose.Schema;

const mongoIdValidator = [
  validate({
    validator: 'isMongoId',
    message: 'Invalid Id',
  }),
];

const challengeStepResult = new Schema({
  challengeId: { type: 'String', required: true, validate: mongoIdValidator },
  challengeStepId: { type: 'String', required: true },
  answer: { type: 'String' },
  score: { type: 'Number', required: true },
  dateFinished: { type: Date, default: Date.now },
});

export default mongoose.model('ChallengeStepResult', challengeStepResult);
