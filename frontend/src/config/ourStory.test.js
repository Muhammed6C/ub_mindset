import test from 'node:test';
import assert from 'node:assert/strict';
import { OUR_STORY } from './ourStory.js';

test('the story keeps its four editable milestones', () => {
  assert.equal(OUR_STORY.milestones.length, 4);
  assert.ok(OUR_STORY.milestones.every(({ date, title, description }) => date && title && description));
});

test('the mindset is expressed through the three core values', () => {
  assert.deepEqual(
    OUR_STORY.values.map(({ title }) => title),
    ['DISCIPLINE', 'FOCUS', 'PROGRESSION'],
  );
});

test('community content is ready to replace without changing the page', () => {
  assert.equal(OUR_STORY.community.testimonials.length, 4);
  assert.match(OUR_STORY.community.memberCount, /^\+/);
  assert.ok(OUR_STORY.community.ctaUrl);
});
