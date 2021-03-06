import test from 'ava';
import supertest from 'supertest-as-promised';
import server from '../../server.js';
import Challenge from '../../models/challenge.js';
import ChallengeAttempt from '../../models/challengeAttempt.js';

const internals = {};

test.before('connecting to challenge?', async () => {
  internals.reqAgent = await supertest(server);
});

test.beforeEach(async () => {
  await Challenge.remove({});
  await ChallengeAttempt.remove({});

  const challengeDoc = await Challenge.create({ name: 'Math Challenge', folderName: 'test_challenge_001' });

  await ChallengeAttempt.create({
    accessCode: 'myAccessCodeTest',
    passCode: 'myPassCodeTest',
    fullName: 'dummyUserNameTest',
    email: 'dummyTest@dummy.com',
    score: 0,
    currentStepId: '001',
    challengeId: challengeDoc._id,
    status: 'not_started',
  });
});

test('should fail if invalid accessCode or passCode', async (t) => {
  const res = await internals.reqAgent
    .get('/api/v1/challengeAttempt?accessCode=wrongAccessCode&passCode=wrongPassCode');

  t.is(res.status, 404);
  t.is(res.body.result, 'error');
  t.falsy(res.body.token, 'token is empty');
  t.truthy(res.body.error, 'got error message');
});


test('should fail with lowercase or uppercase arguments, must be case sensitive', async (t) => {
  const res = await internals.reqAgent
    .get('/api/v1/challengeAttempt?accessCode=MYACCESSCODE-test&passCode=MYPASSCODE-test');

  t.is(res.status, 404);
  t.is(res.body.result, 'error');
  t.falsy(res.body.token, 'token is empty');
  t.truthy(res.body.error, 'got error message');
});


test('should fail if incomplete arguments, error missing params', async (t) => {
  const res = await internals.reqAgent
    .get('/api/v1/challengeAttempt?accessCode=myAccessCodeTest');

  t.is(res.status, 404);
  t.is(res.body.result, 'error');
  t.is(res.body.error, 'missing_parameters');
});


test('should work even if lowerCase endpoint', async (t) => {
  const res = await internals.reqAgent
    .get('/api/v1/challengeattempt?accessCode=myAccessCodeTest&passCode=myPassCodeTest');

  t.is(res.status, 200);
  t.is(res.body.result, 'ok');
  t.truthy(res.body.token, 'got token');
  t.falsy(res.body.error, 'error is empty');
});


test('should succesfully retrive challengeAttempt', async (t) => {
  const res = await internals.reqAgent
    .get('/api/v1/challengeAttempt?accessCode=myAccessCodeTest&passCode=myPassCodeTest');

  t.is(res.status, 200);
  t.is(res.body.result, 'ok');
  t.truthy(res.body.token, 'token is On');
  t.falsy(res.body.error, 'error is empty');
});

test('should fail with post and right credentials', async (t) => {
  const res = await internals.reqAgent
    .post('/api/v1/challengeAttempt')
    .set('Accept', 'application/json')
    .send({ accessCode: 'myAccessCode-test', passCode: 'myPassCode-test' });

  t.is(res.status, 404);
});

test('should not be able to delete challengeAttempt', async (t) => {
  const res = await internals.reqAgent
    .delete('/api/v1/challengeAttempt')
    .set('Accept', 'application/json')
    .send({ accessCode: 'myAccessCode-test', passCode: 'myPassCode-test' });

  t.is(res.status, 404);
});

test('should fail if challengeAttempt status is completed', async (t) => {
  await ChallengeAttempt.update({ accessCode: 'myAccessCodeTest', passCode: 'myPassCodeTest' }, { status: 'completed' });
  const res = await internals.reqAgent
    .get('/api/v1/challengeAttempt?accessCode=myAccessCodeTest&passCode=myPassCodeTest');

  t.is(res.status, 404);
  t.is(res.body.result, 'error');
  t.falsy(res.body.token, 'no token');
  t.is(res.body.error, 'challenge_completed');
});
