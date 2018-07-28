// TODO: More descriptive asserting functions: will require better
// assert-stripping than is provided by ts-transform-unassert at time of writing

export function assert(assertionPassed: boolean, message: string) {
    // TODO: Less invasive reporting than an alert
    if (!assertionPassed) {
        alert(`Assertion failed: ${message}`);
    }
}
