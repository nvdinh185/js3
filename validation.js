
// Đối tượng `Validator`
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMsg;

        // Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (let i = 0; i < rules.length; i++) {
            errorMsg = rules[i](inputElement.value);
            if (errorMsg) break;
        }
        if (errorMsg) {
            errorElement.innerText = errorMsg;
            getParent(inputElement, options.formGroupSelector).querySelector(".form-control").classList.add('invalid');
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).querySelector(".form-control").classList.remove('invalid');
        }

        return !errorMsg;
    }

    // Lấy element của form cần validate
    formElement = document.querySelector(options.form);
    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = document.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            })
            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]');

                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua mỗi rules và xử lý (Lắng nghe sự kiện blur, input...)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = document.querySelector(rule.selector);
            if (inputElement) {
                // xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).querySelector(".form-control").classList.remove('invalid');
                }
            }
        })
    }
}

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, msg) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : msg || "Vui lòng nhập trường này!";
        }
    };
}

Validator.isEmail = function (selector, msg) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : msg || "Trường này phải là email";
        }
    };
}

Validator.minLength = function (selector, min, msg) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : msg || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, msg) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : msg || 'Giá trị nhập vào không chính xác';
        }
    };
}