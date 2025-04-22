-- Sample Data for English Learning Game Database
-- This script provides realistic sample data for testing and development

-- Clear existing data (if needed)
TRUNCATE TABLE "public"."users" CASCADE;
TRUNCATE TABLE "public"."levels" CASCADE;
TRUNCATE TABLE "public"."achievements" CASCADE;
TRUNCATE TABLE "public"."categories" CASCADE;
TRUNCATE TABLE "public"."game_types" CASCADE;
TRUNCATE TABLE "public"."game_activities" CASCADE;
TRUNCATE TABLE "public"."leaderboards" CASCADE;

-- Insert Levels
INSERT INTO "public"."levels" ("level_number", "level_name", "points_required", "description", "badge_url")
VALUES
  (1, 'Beginner', 0, 'Just starting your English learning journey', '/badges/beginner.png'),
  (2, 'Elementary', 100, 'Building foundational English skills', '/badges/elementary.png'),
  (3, 'Pre-Intermediate', 300, 'Expanding your English vocabulary and grammar', '/badges/pre-intermediate.png'),
  (4, 'Intermediate', 600, 'Developing conversational skills and fluency', '/badges/intermediate.png'),
  (5, 'Upper-Intermediate', 1000, 'Refining advanced language concepts', '/badges/upper-intermediate.png'),
  (6, 'Advanced', 1500, 'Mastering complex English usage and nuances', '/badges/advanced.png'),
  (7, 'Proficient', 2200, 'Near-native understanding and usage of English', '/badges/proficient.png'),
  (8, 'Master', 3000, 'Expert-level English language skills', '/badges/master.png');

-- Insert Achievements
INSERT INTO "public"."achievements" ("title", "description", "icon_url", "required_condition", "points_reward")
VALUES
  ('First Steps', 'Complete your first vocabulary lesson', '/achievements/first-steps.png', 'complete_first_lesson', 10),
  ('Word Collector', 'Learn 50 new words', '/achievements/word-collector.png', 'learn_50_words', 25),
  ('Grammar Master', 'Complete 10 grammar lessons with perfect scores', '/achievements/grammar-master.png', 'perfect_grammar_10', 50),
  ('Streak Warrior', 'Maintain a 7-day learning streak', '/achievements/streak-warrior.png', 'streak_7_days', 30),
  ('Vocabulary Virtuoso', 'Learn 200 new words', '/achievements/vocabulary-virtuoso.png', 'learn_200_words', 75),
  ('Perfect Recall', 'Score 100% in a review session', '/achievements/perfect-recall.png', 'perfect_review', 40),
  ('Grammar Genius', 'Master all grammar topics in a category', '/achievements/grammar-genius.png', 'master_grammar_category', 100),
  ('Daily Champion', 'Top the daily leaderboard', '/achievements/daily-champion.png', 'top_daily_leaderboard', 50),
  ('Dedicated Learner', 'Maintain a 30-day learning streak', '/achievements/dedicated-learner.png', 'streak_30_days', 100),
  ('Word Master', 'Learn 500 new words', '/achievements/word-master.png', 'learn_500_words', 150);

-- Insert Categories for Vocabulary
INSERT INTO "public"."categories" ("category_name", "description", "difficulty_level", "order_index", "total_words", "status", "is_vocabulary_course")
VALUES
  ('Essential Basics', 'Foundational vocabulary for everyday communication', 1, 1, 100, 'active', true),
  ('Travel & Tourism', 'Essential words and phrases for travelers', 2, 2, 80, 'active', true),
  ('Business English', 'Professional vocabulary for workplace communication', 3, 3, 120, 'active', true),
  ('Academic Vocabulary', 'Words commonly used in academic settings', 4, 4, 150, 'active', true),
  ('Idioms & Expressions', 'Common English idioms and expressions', 3, 5, 70, 'active', true),
  ('Technology & Internet', 'Modern vocabulary related to digital life', 2, 6, 90, 'active', true),
  ('Health & Medicine', 'Vocabulary related to wellness and healthcare', 3, 7, 80, 'active', true),
  ('Environment & Nature', 'Words related to the natural world', 2, 8, 85, 'active', true);

-- Insert Categories for Grammar
INSERT INTO "public"."categories" ("category_name", "description", "difficulty_level", "order_index", "total_grammar", "status", "is_vocabulary_course")
VALUES
  ('Verb Tenses', 'Present, past, and future tenses explained', 1, 1, 12, 'active', false),
  ('Articles & Determiners', 'Using a, an, the, and other determiners correctly', 2, 2, 8, 'active', false),
  ('Prepositions', 'Mastering in, on, at and other prepositions', 2, 3, 10, 'active', false),
  ('Modal Verbs', 'Using can, could, may, might, will, would, etc.', 3, 4, 9, 'active', false),
  ('Conditionals', 'First, second, and third conditionals explained', 4, 5, 6, 'active', false),
  ('Passive Voice', 'Converting active to passive voice structures', 3, 6, 7, 'active', false),
  ('Reported Speech', 'Converting direct to indirect speech', 4, 7, 5, 'active', false),
  ('Relative Clauses', 'Using who, which, that, and other relative pronouns', 3, 8, 6, 'active', false);

-- Insert sample users
INSERT INTO "public"."users" ("user_id", "username", "email", "password_hash", "full_name", "avatar_url", "current_level", "total_points", "streak_days", "last_active_date", "role")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'johndoe', 'john.doe@gmail.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'John Doe', '/avatars/john-doe.jpg', 3, 450, 5, NOW(), 'user'),
  ('22222222-2222-2222-2222-222222222222', 'janesmith', 'jane.smith@outlook.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Jane Smith', '/avatars/jane-smith.jpg', 4, 720, 12, NOW(), 'user'),
  ('33333333-3333-3333-3333-333333333333', 'mikenguyen', 'mike.nguyen@yahoo.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Mike Nguyen', '/avatars/mike-nguyen.jpg', 2, 280, 3, NOW(), 'user'),
  ('44444444-4444-4444-4444-444444444444', 'sarahpatel', 'sarah.patel@hotmail.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Sarah Patel', '/avatars/sarah-patel.jpg', 5, 1100, 20, NOW(), 'user'),
  ('55555555-5555-5555-5555-555555555555', 'davidlee', 'david.lee@gmail.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'David Lee', '/avatars/david-lee.jpg', 3, 520, 8, NOW(), 'user'),
  ('66666666-6666-6666-6666-666666666666', 'mariatran', 'maria.tran@outlook.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Maria Tran', '/avatars/maria-tran.jpg', 4, 880, 15, NOW(), 'user'),
  ('77777777-7777-7777-7777-777777777777', 'robertchen', 'robert.chen@yahoo.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Robert Chen', '/avatars/robert-chen.jpg', 6, 1650, 30, NOW(), 'user'),
  ('88888888-8888-8888-8888-888888888888', 'annagarcia', 'anna.garcia@gmail.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Anna Garcia', '/avatars/anna-garcia.jpg', 2, 220, 2, NOW(), 'user'),
  ('99999999-9999-9999-9999-999999999999', 'admin', 'admin@englishgame.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'System Admin', '/avatars/admin.jpg', 8, 3500, 45, NOW(), 'admin'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'teacher1', 'teacher1@englishgame.com', '$2a$10$rjJI/I3ru5zOAAX3TdgPC.O3tRSSCdVbhJDhZe3LlA2jt5ff9vbQS', 'Emma Wilson', '/avatars/teacher1.jpg', 7, 2200, 25, NOW(), 'teacher');

-- Insert Vocabulary Words for Essential Basics category
INSERT INTO "public"."vocabulary_words" ("category_id", "word", "pronunciation", "part_of_speech", "definition", "example_sentence", "audio_url", "image_url", "difficulty_level", "paronym_words", "definitions")
VALUES
  (1, 'hello', 'həˈləʊ', 'exclamation', 'Used as a greeting or to begin a phone conversation', 'Hello, how are you today?', '/audio/hello.mp3', '/images/hello.jpg', 1, '{}', '["a greeting", "a way to answer the phone"]'),
  (1, 'goodbye', 'ɡʊdˈbaɪ', 'exclamation', 'Used when leaving or ending a conversation', 'Goodbye, see you tomorrow!', '/audio/goodbye.mp3', '/images/goodbye.jpg', 1, '{}', '["a parting phrase", "a farewell expression"]'),
  (1, 'thank you', 'θæŋk ju:', 'phrase', 'Used to express gratitude', 'Thank you for your help.', '/audio/thank-you.mp3', '/images/thank-you.jpg', 1, '{}', '["expression of gratitude", "acknowledgment of assistance"]'),
  (1, 'please', 'pli:z', 'adverb', 'Used as a polite way of asking for something', 'Could I have some water, please?', '/audio/please.mp3', '/images/please.jpg', 1, '{}', '["polite request marker", "expression of politeness"]'),
  (1, 'sorry', 'ˈsɒri', 'exclamation', 'Used as an apology or expression of regret', 'I''m sorry for being late.', '/audio/sorry.mp3', '/images/sorry.jpg', 1, '{}', '["expression of regret", "apology"]'),
  (1, 'yes', 'jes', 'exclamation', 'Used to give an affirmative response', 'Yes, I agree with you.', '/audio/yes.mp3', '/images/yes.jpg', 1, '{}', '["affirmative response", "positive answer"]'),
  (1, 'no', 'nəʊ', 'exclamation', 'Used to give a negative response', 'No, I don''t want any more.', '/audio/no.mp3', '/images/no.jpg', 1, '{}', '["negative response", "rejection"]'),
  (1, 'help', 'help', 'noun', 'The action of helping someone', 'Can you give me some help with this?', '/audio/help.mp3', '/images/help.jpg', 1, '{}', '["assistance", "support", "aid"]'),
  (1, 'time', 'taɪm', 'noun', 'The indefinite continued progress of existence', 'What time is it?', '/audio/time.mp3', '/images/time.jpg', 1, '{}', '["measure of duration", "period", "hour of day"]'),
  (1, 'water', 'ˈwɔːtə', 'noun', 'A colorless, transparent liquid', 'I need a glass of water.', '/audio/water.mp3', '/images/water.jpg', 1, '{}', '["liquid H2O", "beverage", "natural resource"]');

-- Insert Vocabulary Words for Travel & Tourism category
INSERT INTO "public"."vocabulary_words" ("category_id", "word", "pronunciation", "part_of_speech", "definition", "example_sentence", "audio_url", "image_url", "difficulty_level", "paronym_words", "definitions")
VALUES
  (2, 'passport', 'ˈpɑːspɔːt', 'noun', 'An official document issued by a government, certifying the holder''s identity', 'Don''t forget to bring your passport for international travel.', '/audio/passport.mp3', '/images/passport.jpg', 2, '{}', '["travel document", "identification for international travel"]'),
  (2, 'luggage', 'ˈlʌɡɪdʒ', 'noun', 'Bags and suitcases containing personal belongings for a journey', 'I have three pieces of luggage for my trip.', '/audio/luggage.mp3', '/images/luggage.jpg', 2, '{baggage}', '["bags for travel", "suitcases and personal items"]'),
  (2, 'itinerary', 'aɪˈtɪnərəri', 'noun', 'A planned route or journey', 'Our travel agent prepared a detailed itinerary for our vacation.', '/audio/itinerary.mp3', '/images/itinerary.jpg', 3, '{}', '["travel plan", "schedule of activities", "route plan"]'),
  (2, 'accommodation', 'əˌkɒməˈdeɪʃn', 'noun', 'A place where someone lives or stays', 'The hotel offers luxury accommodation for tourists.', '/audio/accommodation.mp3', '/images/accommodation.jpg', 3, '{}', '["lodging", "place to stay", "housing"]'),
  (2, 'reservation', 'ˌrezəˈveɪʃn', 'noun', 'An arrangement to have something held for someone', 'I made a reservation for dinner at the restaurant.', '/audio/reservation.mp3', '/images/reservation.jpg', 2, '{}', '["booking", "advance arrangement", "scheduled spot"]'),
  (2, 'destination', 'ˌdestɪˈneɪʃn', 'noun', 'A place to which someone or something is going', 'Paris is a popular tourist destination.', '/audio/destination.mp3', '/images/destination.jpg', 2, '{}', '["travel endpoint", "place of arrival", "goal location"]'),
  (2, 'sightseeing', 'ˈsaɪtsiːɪŋ', 'noun', 'The activity of visiting places of interest in a particular location', 'We spent the day sightseeing in Rome.', '/audio/sightseeing.mp3', '/images/sightseeing.jpg', 2, '{}', '["tourist activity", "visiting attractions", "exploration of landmarks"]'),
  (2, 'currency', 'ˈkʌrənsi', 'noun', 'A system of money in general use in a particular country', 'You need to exchange your money for local currency.', '/audio/currency.mp3', '/images/currency.jpg', 2, '{}', '["money", "legal tender", "medium of exchange"]');

-- Insert Grammar Content for Verb Tenses category
INSERT INTO "public"."grammar_contents" ("category_id", "title", "explanation", "examples", "notes", "image_url", "order_index")
VALUES
  (9, 'Present Simple Tense', 'The present simple tense is used to express habits, facts, and routines. It describes actions that happen regularly or states that are generally true.', 'I play tennis every weekend.\nShe works in a bank.\nWater boils at 100 degrees Celsius.', 'Remember to add -s or -es for third-person singular (he/she/it).', '/images/grammar/present-simple.jpg', 1),
  (9, 'Present Continuous Tense', 'The present continuous tense expresses actions happening right now or around the current time period. It''s formed using am/is/are + present participle (verb+ing).', 'I am studying English now.\nThey are building a new house.\nShe is waiting for the bus.', 'Don''t use the present continuous with stative verbs (like, love, believe, etc.).', '/images/grammar/present-continuous.jpg', 2),
  (9, 'Past Simple Tense', 'The past simple tense is used for actions completed in the past. Regular verbs add -ed, while irregular verbs have special past forms.', 'I watched a movie yesterday.\nShe bought a new car last week.\nThey went to Paris last summer.', 'Time expressions: yesterday, last week, in 2010, etc.', '/images/grammar/past-simple.jpg', 3),
  (9, 'Past Continuous Tense', 'The past continuous tense describes actions that were in progress at a specific time in the past. It''s formed with was/were + present participle.', 'I was reading when she called.\nThey were playing tennis at 5pm yesterday.\nWhat were you doing at midnight?', 'Often used with "when" and "while" clauses.', '/images/grammar/past-continuous.jpg', 4),
  (9, 'Present Perfect Tense', 'The present perfect tense connects the past to the present. It''s used for past actions with a present result, or experiences without a specific time. Formed with have/has + past participle.', 'I have lived in London for five years.\nShe has visited Paris three times.\nHave you ever eaten sushi?', 'Used with: ever, never, already, yet, since, for, just.', '/images/grammar/present-perfect.jpg', 5);

-- Insert Grammar Content for Articles & Determiners category
INSERT INTO "public"."grammar_contents" ("category_id", "title", "explanation", "examples", "notes", "image_url", "order_index")
VALUES
  (10, 'Definite Article: The', 'The definite article "the" is used when we talk about something specific that both the speaker and listener know about.', 'The book on the table is mine.\nI loved the movie we saw yesterday.\nThe Eiffel Tower is in Paris.', 'Use "the" with specific nouns, superlatives, musical instruments, and unique things.', '/images/grammar/definite-article.jpg', 1),
  (10, 'Indefinite Articles: A/An', 'The indefinite articles "a" and "an" are used when talking about something for the first time, or something that is one of many.', 'I need a pen.\nShe is an architect.\nWe saw a movie last night.', 'Use "a" before consonant sounds and "an" before vowel sounds.', '/images/grammar/indefinite-articles.jpg', 2),
  (10, 'Quantifiers: Some/Any', 'Quantifiers tell us how much or how many of something there is. "Some" is generally used in positive sentences, while "any" is used in questions and negatives.', 'I have some apples.\nDo you have any questions?\nThere aren''t any books on the shelf.', 'Exceptions exist, like offering questions: "Would you like some coffee?"', '/images/grammar/quantifiers.jpg', 3);

-- Insert Game Types
INSERT INTO "public"."game_types" ("game_name", "description", "icon_url", "instructions")
VALUES
  ('Flashcards', 'Test your memory and recall of vocabulary words with flashcards', '/icons/flashcards.png', 'Flip through cards to see words and their definitions. Mark cards as known or unknown to track your progress.'),
  ('Multiple Choice Quiz', 'Test your knowledge with multiple choice questions', '/icons/multiple-choice.png', 'Select the correct answer from four options for each question. Immediate feedback is provided.'),
  ('Word Association', 'Connect words that are related to each other', '/icons/word-association.png', 'Draw lines to match words that are related by meaning, category, or use.'),
  ('Sentence Builder', 'Create correct sentences by arranging words', '/icons/sentence-builder.png', 'Drag and drop words to form grammatically correct sentences.'),
  ('Fill in the Blanks', 'Complete sentences by filling in missing words', '/icons/fill-blanks.png', 'Type the correct word to fill in each blank in a sentence.'),
  ('Word Scramble', 'Unscramble letters to form correct words', '/icons/word-scramble.png', 'Rearrange the given letters to form a word matching the provided definition.');

-- Insert Game Activities
INSERT INTO "public"."game_activities" ("game_type_id", "activity_name", "description", "skill_focus", "difficulty_level", "points_reward", "time_limit_seconds", "instructions")
VALUES
  (1, 'Basic Vocabulary Flashcards', 'Practice essential vocabulary words with flashcards', 'Vocabulary Recognition', 1, 10, 300, 'Flip through flashcards and mark each word as "Known" or "Still Learning"'),
  (1, 'Travel Vocabulary Flashcards', 'Learn travel-related words with flashcards', 'Vocabulary Recognition', 2, 15, 300, 'Review travel vocabulary with flashcards and test your knowledge'),
  (2, 'Grammar Quiz: Verb Tenses', 'Test your knowledge of English verb tenses', 'Grammar Understanding', 3, 20, 600, 'Select the correct verb tense for each sentence'),
  (2, 'Vocabulary Quiz: Synonyms', 'Find words with similar meanings', 'Vocabulary Range', 2, 15, 450, 'Choose the word that has a similar meaning to the given word'),
  (3, 'Business English Associations', 'Connect related business English terms', 'Vocabulary Relationships', 3, 20, 300, 'Draw lines between related business terms and concepts'),
  (4, 'Present Tense Sentence Building', 'Create sentences in the present tense', 'Grammar Application', 2, 20, 600, 'Arrange words to create grammatically correct sentences in present tense'),
  (5, 'Academic Vocabulary Fill-in', 'Complete academic sentences with appropriate words', 'Vocabulary Usage', 4, 25, 600, 'Type the correct academic term to complete each sentence'),
  (6, 'Everyday Words Scramble', 'Unscramble common English words', 'Spelling & Word Recognition', 1, 15, 300, 'Rearrange letters to form everyday English words');

-- Insert Game Questions for basic vocabulary flashcards activity
INSERT INTO "public"."game_questions" ("activity_id", "question_type", "question_text", "correct_answer", "options", "hint", "explanation", "points", "related_word_id")
VALUES
  (1, 'flashcard', 'What does this word mean?', 'Used as a greeting or to begin a phone conversation', NULL, 'Think about how you start a conversation', 'Hello is one of the most basic greetings in English.', 5, 1),
  (1, 'flashcard', 'What does this word mean?', 'Used when leaving or ending a conversation', NULL, 'Think about how you end a conversation', 'Goodbye is a common farewell expression.', 5, 2),
  (1, 'flashcard', 'What does this word mean?', 'Used to express gratitude', NULL, 'Something you say when someone helps you', 'Thank you is how we express appreciation in English.', 5, 3),
  (1, 'flashcard', 'What does this word mean?', 'Used as a polite way of asking for something', NULL, 'A polite word when making requests', 'Please makes requests sound more polite and respectful.', 5, 4);

-- Insert Game Questions for grammar quiz activity
INSERT INTO "public"."game_questions" ("activity_id", "question_type", "question_text", "correct_answer", "options", "hint", "explanation", "points", "related_grammar_id")
VALUES
  (3, 'multiple_choice', 'She _____ to work every day.', 'goes', '{"goes", "go", "going", "gone"}', 'Think about the subject (she) and the present simple tense', 'In present simple tense, third-person singular subjects (he/she/it) require the verb with -s or -es ending.', 5, 1),
  (3, 'multiple_choice', 'I _____ a book right now.', 'am reading', '{"am reading", "read", "reads", "have read"}', 'Consider what tense shows an action happening at this moment', 'Present continuous (am/is/are + verb-ing) is used for actions happening right now.', 5, 2),
  (3, 'multiple_choice', 'Yesterday, they _____ to the cinema.', 'went', '{"went", "go", "have gone", "are going"}', 'This happened in the past at a specific time', 'Past simple is used for completed actions in the past, and "went" is the past tense of "go".', 5, 3),
  (3, 'multiple_choice', 'While I _____ dinner, the phone rang.', 'was cooking', '{"was cooking", "cooked", "cook", "am cooking"}', 'An action in progress when interrupted by another past action', 'Past continuous (was/were + verb-ing) shows an action in progress in the past.', 5, 4);

-- Insert User Achievements
INSERT INTO "public"."user_achievements" ("user_id", "achievement_id", "date_achieved")
VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '2023-01-15'),
  ('11111111-1111-1111-1111-111111111111', 2, '2023-02-10'),
  ('22222222-2222-2222-2222-222222222222', 1, '2023-01-20'),
  ('22222222-2222-2222-2222-222222222222', 2, '2023-02-15'),
  ('22222222-2222-2222-2222-222222222222', 3, '2023-03-10'),
  ('33333333-3333-3333-3333-333333333333', 1, '2023-02-05'),
  ('44444444-4444-4444-4444-444444444444', 1, '2023-01-10'),
  ('44444444-4444-4444-4444-444444444444', 2, '2023-02-05'),
  ('44444444-4444-4444-4444-444444444444', 3, '2023-03-15'),
  ('44444444-4444-4444-4444-444444444444', 4, '2023-04-01'),
  ('77777777-7777-7777-7777-777777777777', 1, '2022-12-15'),
  ('77777777-7777-7777-7777-777777777777', 2, '2023-01-10'),
  ('77777777-7777-7777-7777-777777777777', 3, '2023-02-05'),
  ('77777777-7777-7777-7777-777777777777', 4, '2023-02-28'),
  ('77777777-7777-7777-7777-777777777777', 6, '2023-03-15'),
  ('77777777-7777-7777-7777-777777777777', 9, '2023-04-10');

-- Insert User Progress
INSERT INTO "public"."user_progress" ("user_id", "category_id", "mastery_level", "times_practiced", "last_practiced", "next_review_date", "process_percentage")
VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 75.5, 5, '2023-04-15', '2023-04-25', 75),
  ('11111111-1111-1111-1111-111111111111', 9, 60.0, 3, '2023-04-10', '2023-04-20', 60),
  ('22222222-2222-2222-2222-222222222222', 1, 90.0, 8, '2023-04-18', '2023-04-25', 90),
  ('22222222-2222-2222-2222-222222222222', 2, 65.0, 4, '2023-04-12', '2023-04-22', 65),
  ('22222222-2222-2222-2222-222222222222', 9, 85.5, 6, '2023-04-17', '2023-04-24', 85),
  ('33333333-3333-3333-3333-333333333333', 1, 45.0, 2, '2023-04-05', '2023-04-20', 45),
  ('44444444-4444-4444-4444-444444444444', 1, 95.0, 10, '2023-04-19', '2023-04-26', 95),
  ('44444444-4444-4444-4444-444444444444', 2, 85.0, 7, '2023-04-18', '2023-04-25', 85),
  ('44444444-4444-4444-4444-444444444444', 9, 88.5, 8, '2023-04-16', '2023-04-24', 88),
  ('44444444-4444-4444-4444-444444444444', 10, 75.0, 5, '2023-04-14', '2023-04-23', 75),
  ('77777777-7777-7777-7777-777777777777', 1, 100.0, 15, '2023-04-20', '2023-04-30', 100),
  ('77777777-7777-7777-7777-777777777777', 2, 100.0, 12, '2023-04-19', '2023-04-29', 100),
  ('77777777-7777-7777-7777-777777777777', 3, 95.5, 10, '2023-04-18', '2023-04-28', 95),
  ('77777777-7777-7777-7777-777777777777', 9, 100.0, 15, '2023-04-20', '2023-04-30', 100),
  ('77777777-7777-7777-7777-777777777777', 10, 90.0, 9, '2023-04-17', '2023-04-27', 90);

-- Insert User Activities
INSERT INTO "public"."user_activities" ("user_id", "activity_id", "start_time", "end_time", "score", "answers_correct", "answers_wrong", "points_earned", "completion_status")
VALUES
  ('11111111-1111-1111-1111-111111111111', 1, '2023-04-15 10:30:00', '2023-04-15 10:40:00', 80, 8, 2, 8, 'completed'),
  ('11111111-1111-1111-1111-111111111111', 3, '2023-04-10 15:45:00', '2023-04-10 16:00:00', 70, 7, 3, 14, 'completed'),
  ('22222222-2222-2222-2222-222222222222', 1, '2023-04-18 09:00:00', '2023-04-18 09:15:00', 100, 10, 0, 10, 'completed'),
  ('22222222-2222-2222-2222-222222222222', 2, '2023-04-12 14:20:00', '2023-04-12 14:35:00', 90, 9, 1, 13, 'completed'),
  ('22222222-2222-2222-2222-222222222222', 3, '2023-04-17 11:10:00', '2023-04-17 11:30:00', 85, 17, 3, 17, 'completed'),
  ('33333333-3333-3333-3333-333333333333', 1, '2023-04-05 16:00:00', '2023-04-05 16:10:00', 60, 6, 4, 6, 'completed'),
  ('44444444-4444-4444-4444-444444444444', 1, '2023-04-19 08:30:00', '2023-04-19 08:40:00', 100, 10, 0, 10, 'completed'),
  ('44444444-4444-4444-4444-444444444444', 2, '2023-04-18 13:15:00', '2023-04-18 13:30:00', 93, 14, 1, 14, 'completed'),
  ('44444444-4444-4444-4444-444444444444', 3, '2023-04-16 17:00:00', '2023-04-16 17:20:00', 90, 18, 2, 18, 'completed');

-- Insert Leaderboards
INSERT INTO "public"."leaderboards" ("name", "period_type", "start_date", "end_date")
VALUES
  ('Daily Stars', 'daily', CURRENT_DATE, CURRENT_DATE),
  ('Weekly Champions', 'weekly', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
  ('Monthly Masters', 'monthly', DATE_TRUNC('month', CURRENT_DATE)::date, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date),
  ('All-Time Legends', 'all-time', NULL, NULL);

-- Insert leaderboard entries
INSERT INTO "public"."leaderboard_entries" ("leaderboard_id", "user_id", "score", "rank")
VALUES
  (1, '77777777-7777-7777-7777-777777777777', 120, 1),
  (1, '44444444-4444-4444-4444-444444444444', 95, 2),
  (1, '22222222-2222-2222-2222-222222222222', 85, 3),
  (1, '11111111-1111-1111-1111-111111111111', 65, 4),
  (1, '33333333-3333-3333-3333-333333333333', 40, 5),
  (2, '77777777-7777-7777-7777-777777777777', 580, 1),
  (2, '44444444-4444-4444-4444-444444444444', 520, 2),
  (2, '22222222-2222-2222-2222-222222222222', 450, 3),
  (2, '66666666-6666-6666-6666-666666666666', 380, 4),
  (2, '11111111-1111-1111-1111-111111111111', 320, 5),
  (3, '77777777-7777-7777-7777-777777777777', 2200, 1),
  (3, '44444444-4444-4444-4444-444444444444', 1850, 2),
  (3, '66666666-6666-6666-6666-666666666666', 1580, 3),
  (3, '22222222-2222-2222-2222-222222222222', 1320, 4),
  (3, '55555555-5555-5555-5555-555555555555', 980, 5),
  (4, '99999999-9999-9999-9999-999999999999', 3500, 1),
  (4, '77777777-7777-7777-7777-777777777777', 3200, 2),
  (4, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2800, 3),
  (4, '44444444-4444-4444-4444-444444444444', 2400, 4),
  (4, '66666666-6666-6666-6666-666666666666', 2100, 5);

-- Insert User Review Words
INSERT INTO "public"."user_review_words" ("user_id", "word_id", "added_at")
VALUES
  ('11111111-1111-1111-1111-111111111111', 3, '2023-04-12'),
  ('11111111-1111-1111-1111-111111111111', 5, '2023-04-14'),
  ('22222222-2222-2222-2222-222222222222', 8, '2023-04-15'),
  ('22222222-2222-2222-2222-222222222222', 10, '2023-04-16'),
  ('22222222-2222-2222-2222-222222222222', 11, '2023-04-17'),
  ('44444444-4444-4444-4444-444444444444', 12, '2023-04-18'),
  ('44444444-4444-4444-4444-444444444444', 15, '2023-04-19');

-- Insert User Flash Card Answers
INSERT INTO "public"."user_flashcard_answers" ("user_id", "word_id", "is_correct", "process_id", "created_at")
VALUES
  ('11111111-1111-1111-1111-111111111111', 1, true, 1, '2023-04-15'),
  ('11111111-1111-1111-1111-111111111111', 2, true, 1, '2023-04-15'),
  ('11111111-1111-1111-1111-111111111111', 3, false, 1, '2023-04-15'),
  ('11111111-1111-1111-1111-111111111111', 4, true, 1, '2023-04-15'),
  ('22222222-2222-2222-2222-222222222222', 1, true, 3, '2023-04-18'),
  ('22222222-2222-2222-2222-222222222222', 2, true, 3, '2023-04-18'),
  ('22222222-2222-2222-2222-222222222222', 3, true, 3, '2023-04-18'),
  ('22222222-2222-2222-2222-222222222222', 4, true, 3, '2023-04-18'),
  ('44444444-4444-4444-4444-444444444444', 1, true, 7, '2023-04-19'),
  ('44444444-4444-4444-4444-444444444444', 2, true, 7, '2023-04-19'),
  ('44444444-4444-4444-4444-444444444444', 3, true, 7, '2023-04-19'),
  ('44444444-4444-4444-4444-444444444444', 4, true, 7, '2023-04-19');

-- Insert User Answers for activities
INSERT INTO "public"."user_answers" ("activity_log_id", "question_id", "user_answer", "is_correct", "time_taken_seconds", "points_earned")
VALUES
  (1, 1, 'Used as a greeting or to begin a phone conversation', true, 5, 5),
  (1, 2, 'Used when leaving or ending a conversation', true, 4, 5),
  (1, 3, 'Used to express gratitude', true, 6, 5),
  (1, 4, 'Used as a way to apologize', false, 8, 0),
  (3, 1, 'Used as a greeting or to begin a phone conversation', true, 3, 5),
  (3, 2, 'Used when leaving or ending a conversation', true, 2, 5),
  (3, 3, 'Used to express gratitude', true, 4, 5),
  (3, 4, 'Used as a polite way of asking for something', true, 3, 5),
  (5, 5, 'goes', true, 10, 5),
  (5, 6, 'am reading', true, 12, 5),
  (5, 7, 'went', true, 8, 5),
  (5, 8, 'was cooking', true, 15, 5);