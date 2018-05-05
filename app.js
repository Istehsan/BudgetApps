//UI Controller
var UIController = (function () {
    var DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputbtn: '.add__btn',
        UIExpense: '.expenses__list',
        UIIncome: '.income__list',
        totalBudget: '.budget__value',
        totalIncome:'.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalPercentage: '.budget__expenses--percentage',
        container:'.container'
    };

    return {
        getInputs: function() {
            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseFloat( document.querySelector(DomStrings.inputValue).value)
            };
        },

        getDomStrings: function() {
            return DomStrings;
        },

        addItemsToUI: function (obj, type) {
            var HTML, newHTML, element;

            if (type === 'inc') {
                element = DomStrings.UIIncome;
                HTML = '<div class="item clearfix" id="inc-%id%"><div class="item__description" > %description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
            }
            else if (type === 'exp') {
                element = DomStrings.UIExpense
                HTML = '<div class="item clearfix" id="exp-%id%"><div class="item__description" > %description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
            }
            newHTML = HTML.replace('%id%', obj.ID);
            newHTML = newHTML.replace('%description%', obj.desc);
            newHTML=newHTML.replace('%value%', obj.val);
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);



        },
        deleteItemsFromUI: function (selectId) {
            var element = document.getElementById(selectId);
            element.parentNode.removeChild(element);
        },
        displayBudgets: function (obj) {
            document.querySelector(DomStrings.totalBudget).textContent = obj.budget;
            document.querySelector(DomStrings.totalIncome).textContent = obj.totalInc;
            document.querySelector(DomStrings.totalExpense).textContent = obj.totalExp;
            document.querySelector(DomStrings.totalPercentage).textContent = obj.percentage > 0 ? obj.percentage + '%' : '--';
        },
        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
            
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = '';
            })
            fields[0].focus();
        }
    };
})();




//Budget Controller
var BudgetController = (function () {

    var income = function (id,desc,val) {
        this.ID = id;
        this.desc = desc;
        this.val = val;
    };

    var Expense = function (id, desc, val) {
        this.ID = id;
        this.desc = desc;
        this.val = val;
    };

    var data = {
        allItems: {
            exp: [],
            inc:[]
        },

        totals: {
            exp: 0,
            inc:0
        },
        budget: 0,
        percentage: -1
    }

    calculateTotals= function(type) {
        var sum, budget, percentage;
        sum = 0;

        data.allItems[type].forEach(function (current) {

            sum = sum + current.val;
            
        })

        data.totals[type] = sum;

    }

    return {
        addItems: function (type, desc, val) {
            var id;
            if (data.allItems[type].length > 0) {
                id= data.allItems[type][data.allItems[type].length - 1].ID + 1;
            } else {
                id = 1;

            }

            var newItem = type === 'exp' ? new Expense(id, desc, val) : new income(id, desc, val);
            data.allItems[type].push(newItem);

            return newItem;
        },
        calculateBudget: function () {
            calculateTotals('inc');
            calculateTotals('exp');

            data.budget = data.totals.inc - data.totals.exp;

            percentage = data.totals.inc > 0 ? Math.round((data.totals.exp / data.totals.inc) * 100) : -1;
            data.percentage = percentage;
            //console.log(percentage + "   " + data.totals.inc + "  " + data.budget + "  " + data.percentage);
            

        },
        calculatePercentage: function () {

        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },


        deleteItems: function (type, id) {
            var newIdArray, index;
            var newIdArray = data.allItems[type].map(function (current) {
                return current.ID;
            })
            index = newIdArray.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        test: function () {
            console.log( data);
        }
    }

})();





//Main Controller
var Controller = (function (budgetCtrl, uiCtrl) {
 
    var ctrlAddItems = function () {
        // 1. Get the field input data
        var input = uiCtrl.getInputs();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to Budget Controller
            newItems = budgetCtrl.addItems(input.type, input.description, input.value);


            // 3. Add the items into UI
            uiCtrl.addItemsToUI(newItems, input.type);

            // 4. Clear Fields
            uiCtrl.clearFields();

            // 5. Calculate and return the Budget
            calculateBudget();

            // 6. Calculate and Update Expense Percentage


        }
    

    };

    var ctrlDeleteItems = function (event) {
        var eventItem, eventArray, type, id;
        eventItem = event.target.parentNode.parentNode.parentNode.parentNode.id;
        eventArray = eventItem.split('-');
        type = eventArray[0];
        id = parseInt( eventArray[1]);

        // 1. Delete items from dataStructure and update it
        budgetCtrl.deleteItems(type, id);

        // 2. Delete items from UI
        uiCtrl.deleteItemsFromUI(eventItem);

        // 3. Update budget
        calculateBudget();
    };

    calculateBudget= function() {
        // 1. Calculate the Budget
        budgetCtrl.calculateBudget();
        budgetCtrl.calculateBudget();

        // 2. Return the Budget
        var budgets = budgetCtrl.getBudget();
        

        // 3. Display the Budget in the UI
        uiCtrl.displayBudgets(budgets);
    }
    calculatePercentage = function () {
        // 1. calculate percentage

        // 2. return percentage

        // 3. update percentage in the UI
    }

    var StartEventListener = function () {
        var domStrings = uiCtrl.getDomStrings();
        var btnDom = document.querySelector(domStrings.inputbtn).addEventListener('click', ctrlAddItems);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItems();
            }
        })
        document.querySelector(domStrings.container).addEventListener('click', ctrlDeleteItems);
        
        
    }

    return {
        Init: function () {
            budgetInitial = {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage:-1
            }
            uiCtrl.displayBudgets(budgetInitial);
            StartEventListener();
        }
    }

})(BudgetController, UIController);

Controller.Init();