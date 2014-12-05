/**
 * Make your matchers available in Jasmine.
 * 
 * Angular's Jasmine lifecycle complicates adding matchers globally.
 * The workaround is to use a global beforeEach() to add them before every test can run.
 *
 * In theory this is a lot of extra 'work' but practice this is exceptionally fast.
 **/

beforeEach(function () {
    jasmine.addMatchers({
        toHaveText: function () {
            return {
                compare: function (actual, expected) {
                    var pass = actual.text().trim() === expected;
                    var toHave = pass ? "not to have" : "to have";

                    return {
                        pass: pass,
                        message: "Expected '" + angular.mock.dump(actual) + "' " + toHave + " the text '" + expected + "'"
                    };
                }
            };
        },
        toContainText: function () {
            return {
                compare: function (actual, expected) {
                    var text = actual.text();
                    var pass = text != null && (text.indexOf(expected) > -1 );
                    var toHave = pass ? "not to have" : "to have";

                    return {
                        pass: pass,
                        message: "Expected '" + angular.mock.dump(actual) + "' " + toHave + " the text '" + expected + "'"
                    };
                }
            };
        },
        toHaveClass: function () {
            return {
                compare: function (actual, expected) {
                    var pass = actual.hasClass(expected);
                    var toHave = pass ? "not to have" : "to have";

                    return {
                        pass: pass,
                        message: "Expected '" + angular.mock.dump(actual) + "' " + toHave + " a class '" + expected + "'."
                    };
                }
            };
        },
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
    });
});

