Jasmine 2.0 Matchers, with AngularJS
====================================

One of the breaking changes with Jasmine 2.0 was a change to how Matchers are written.  Using Jasmine with AngularJS 
introduces another set of limitations that I will cover in due course.

Why Matchers?
=============
    
A matcher lets you extract repeated code around your 'assert' and 'equals' methods and reuse them across all of your
tests.  In addition to removing potential bugs in your tests (debug once, reuse everywhere), they can also provide more
detailed text for failed tests than you get from the built-in test methods.

### Code Reuse

We spend a lot of time teaching people not to repeat themselves when writing production code, and people are naturally
averse to breaking all of these rules when they write tests.  In reaction people have invented a lot of solutions to
this 'problem', some of them are good and a lot of them are counterproductive; they help you write the initial set of
tests but make it hard to keep them working over time.  See the endless "DRY vs DAMP" debates that rage seemingly
forever on the internet. 

The authors of Testing frameworks recognize this problem, and most frameworks have provided a generous set of tools for
eliminating these issues.  Unfortunately they are often misused, or aren't used at all. Matchers are a crucial but often
overlooked tool in this toolbox.  

### Diagnostics

    Expected undefined to be 'true'.
    
How many times have you seen this dreaded message? What does that even mean? It might as well say `Test failed.`, which
is exactly what the line preceding the error said, so it provides no extra information whatsoever.   

A Matcher gives you an opportunity to provide a detailed failure message, providing debugging information to the user 
when it is the most useful.  Often it can steer them to a solution without ever having to use the debugger.  
  
    Expected <input name="foo" type="checkbox"></input> to be checked.
    
Doesn't that tell you so much more about what's wrong?

How do Matchers work?
=====================

In most test frameworks a Matcher provides two answers for every call.  Whether the test case passed, and what error to
display if it didn't.  The framework watches for the failure and handles the bookkeeping to determine which tests passed
which didn't, and where they failed if they didn't.

However Jasmine goes one step farther in 2.0.  In a bid to remove a lot of nearly duplicate Matchers, they introduced
the `.not` operator that inverts the result of the test.  Now instead of needing a `toBeNull()` and `toNotBeNull()` 
matcher, I just need `toBeNull()` and if I want the opposite of that I use `not.toBeNull()`.

Unfortunately this requires a different structure for the Matcher functions, which isn't backward compatible, and may
look a little odd if you don't understand all of this background I've shared with you.

    toBeHidden: function () {
        return {
            compare: function (actual) {
                var expected = 'ng-hide';
                var pass = actual.hasClass(expected);
                var toHave = pass ? "not to have" : "to have";

                return {
                    pass: pass,
                    message: "Expected '" + angular.mock.dump(actual) + "' " + toHave + " a class '" + expected + "'."
                };
            }
        };
    }

### What's going on in here?

At the innermost point of this code we're testing a DOM element for visibility, assuming it is using the `ng-hide` 
directive to conditionally display a piece of UI.  The rest of the code seems to be about putting together an error 
message.

In Jasmine as each test runs, it generates a status and a message.  If the status is 'false' then the message appears
in the test results, otherwise it is swallowed.  Unless the `.not` operator was used, in which case if the status is 
'true' then the message appears.  

So what we do is we check assertion, if it returns false we generate an error explaining that we wanted the condition
to be true.  If it returns true we generate an error that explains that we did not want this condition to be true.  

The last bit, and perhaps the most important, is the debugging output in the response message. `angular.mock.dump(actual)`
turns a cryptic error with very little useful content into a message that contains the object under test.  In this case
it's a DOM element, and so the user will have a much better idea of what's broken and can hone in on the solution more
quickly.


Loading Matchers
================

### The Problem

In the old days with Jasmine there were many ways to get your Matchers loaded.  You could just poke them into one of the
data structures.  However Angular does some monkey patching of Jasmine and several of the old strategies no longer work.
In the official Jasmine documentation they recommend loading the matchers at the top of every test suite.  While this
is compatible with Angular's strategy of reloading Jasmine over and over again, the tendency toward many small modules
with small test suites and that boilerplate can get a bit crazy.

### The Solution

Some clever people figured out that a naked beforeEach (outside of a `describe()`) works just fine in Angular.js.  

    /**
     * matchers.js
     **/
    
    beforeEach(function () {
        jasmine.addMatchers({
            toContainText: function () {
                ...
            },
            toHaveClass: function () {
                ...
            },
            toBeHidden: function () {
                ...
            }
        });
    });
  
If you load the matchers before the first test file, then this block will load before every test, and you're good.  
Jasmine is so fast that running this bit of boilerplate before every test hardly impacts your test speed.  On my last
project our unit tests averaged 15 milliseconds per test (1400 in 22 seconds), which is well within the range of the 
definition of 'fast unit tests'.

I've provided a [matchers.js](https://raw.githubusercontent.com/dev9com/jasmine-matchers/master/matchers.js) file for 
you, containing this setup pattern along with a few of my favorite Angular-compatible matchers.  


Designing a good matcher
======================

One of the tenets of Testing is that unit tests should test (or assert) exactly one thing.  This means you set up a 
scenario, and then prove that one single, specific aspect of that scenario holds true.  In real code it's common for a 
single scenario to have a number of consequences, and if you want one assertion per test that means you're going to be 
repeating a lot of effort and code.  

The setup and teardown (beforeEach, afterEach) methods remove the Lion's Share of boilerplate from your tests, and in
Jasmine they can go even farther because you can organize partly related tests with nested setup methods, removing far
more duplication from your boilerplate.

But after the setup and before the teardown there is often a smaller but far more important tangle of repetitive code
that sets up the conditions for the assertion.  Some people write their own custom helper functions to deal with this, 
but a Matcher is usually the correct solution to this problem.

## Pick something to match

As with refactoring normal code, your goal is to end up with a set of short and sweet functions with descriptive names
and straightforward internals.  

Things to consider for a Matcher:

1. Do I have lots of scenarios that lead to the same outcome?
1. Do I use the same Object in many places to report an outcome?
1. Do I have lots of objects that behave similarly?

The last one requires some caution.  'Similar' code often indicates a missing level of refactoring is needed. Trying to
create a matcher prior to doing this work may actually complicate the rework.  It's a matter of when you need coverage
on the code and which sources of pain you can avoid.

In an Angular app the conceptual space is pretty small, so this work can be pretty obvious in many situations.  You
have lots of code that deals with JSON responses, lots of code that works with DOM elements, and both can benefit from 
having Matchers that test attributes, presence of children, String comparisons (loose and strict), etc.  

## Reporting is Key

The big rule for any Matcher is that you have to clearly state what the problem is in a failure condition.  Remember
that we write tests largely to help keep people from accidentally breaking our code later in the project.  During that 
delicate time where they're trying to write a new feature, a good error message can often tell the person what they
broke without them having to context switch to look at your test.  

And in the case of a bug, remember that the person fixing it may already be frustrated with the situation before work
starts, don't pile onto that frustration with cryptic or subtly misleading test failure messages. Be kind. The sanity
you save may be your own.

There is a short list of things I always put into my matcher messages:

1. I should know which matcher failed by the message.  Make each one unique.
1. The actual and expected values must appear.
1. The actual should always appear before the expected. Common convention avoids confusion.
1. Using a `dump()` method to report the entire 'actual' object is wordy, but may save you from starting the debugger.
1. The values should be bracketed in some way so whitespace errors are obvious.


Bracketing turns this:

    Expected  foo to be foo

into this:

    Expected ' foo' to be 'foo'

You may notice the error in the first message immediately, or you might not. If you don't, you'll feel pretty stupid
later on.  But is that extra whitespace an error in the code, or did I get the string concatenation wrong in my Matcher
and that extra whitespace is a red herring?  The latter message makes it pretty dead obvious what happened, and takes
only a couple seconds longer to write.

## Always double-check your work

Rule #1 of Matchers: Any time you change a matcher, force some tests to fail to verify that the error makes sense.

It's easy to get the boolean logic wrong and have a set of tests that fail silently.  It's easy to invert the meaning 
of the error message and not notice.  It's really pretty easy to check:

    expect(answer).toEqual('blah');
    
Just try both of these negative tests:

    // Check the error message
    expect(answer).not.toEqual('blah');

    // Check the equality test
    expect(answer).toEqual('something else');

And maybe throw in a null check, and you've got a pretty good idea that your matcher won't fail on you later.

Good luck!
