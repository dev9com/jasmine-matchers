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

