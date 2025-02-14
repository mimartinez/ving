/**
 * Turns an enum value into an enum label as defined in a schema.
 * @param {string|boolean} value An enum value.
 * @param {Object[]} options an array of objects containing enum options.
 * @returns {string} A string as a label.
 * @example
 * enum2label('archived', [{value: 'archived', label:'Is Archived'},...])
 */

export default (value, options) => {
    const option = options.find((a) => a.value == value);
    if (option)
        return option.label;
    return `'${value}' not a valid enum`;
}