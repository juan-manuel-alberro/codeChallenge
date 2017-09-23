import ChallengeAttempt from '../../models/challengeAttempt';
import jwt from 'jsonwebtoken';
import * as config from '../../config';

export function validateParams(req, res, next) {
  const accessCode = req.query.accessCode;
  const passCode = req.query.passCode;
  if (!accessCode || !passCode) {
    return res.status(404).json({ result: 'error', error: 'missing_parameters' });
  }
  req.validatedParams = { accessCode, passCode }; // eslint-disable-line no-param-reassign
  return next();
}

export function loadChallengeAttempt(req, res, next) {
  const accessCodeValue = req.validatedParams.accessCode;
  const passCodeValue = req.validatedParams.passCode;
  return ChallengeAttempt.findOne({ accessCode: accessCodeValue, passCode: passCodeValue })
    .then((challengeAttempt) => {
      if (!challengeAttempt) {
        return res.status(404).json({ result: 'error', token: '', error: 'invalid_access_tokens' });
      }
      req.challengeAttemptDoc = challengeAttempt; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch(/* istanbul ignore next */(e) => {
      /* istanbul ignore next */
      const output = { result: 'error', error: 'internal_error', message: e.message };
      /* istanbul ignore next */
      return res.status(500).json(output);
    });
}

export function validateAttemptStatus(req, res, next) {
  const status = req.challengeAttemptDoc.status;
  if (status === 'completed') {
    return res.status(404).json({ result: 'error', token: '', error: 'challenge_completed' });
  }
  return next();
}

export function generateToken(req, res, next) {
  const payLoad = {
    challengeAttemptId: req.challengeAttemptDoc._id,
    challengeId: req.challengeAttemptDoc.challengeId,
  };
  const options = {};
  const key = config.default.secretKey;
  jwt.sign(payLoad, key, options, (err, token) => {
    if (err) {
      /* istanbul ignore next */
      return res.status(500).json({ result: 'error', error: 'internal_error' });
    }
    req.token = token; // eslint-disable-line no-param-reassign
    return next();
  });
}

export function sendToken(req, res) {
  const output = {
    result: 'ok',
    token: req.token,
    error: '',
    userFullName: req.challengeAttemptDoc.fullName,
  };
  res.status(200).json(output);
}
