define([
  // Libs
  "jquery",
  "jqueryui",
  "Handlebars",
  "FacilityViewTmplt",
  "Generator",
  "Facility",
  "ModelData"
], function ($, JQUI, Handlebars, FacilityViewTmplt, Generator, Facility, ModelData) {
  return (

    class FacilityViewDialog {
      constructor(facilityId, facilityTypeId = null) {
        console.log();
        // Dialog 
        this._dialog = null;
        this._facilityId = facilityId;
        this._facilityTypeId = facilityTypeId;

        // Parameters
        this._width = 750;
        this._height = 640;
        this._isModel = true;
        this._position = {};
        this._title = "Facility Viewer";
        this._modelsLoaded = false;
        this._applyButtonOn = false;

        // Element Ids
        this._elementIdAnchor = "facility-dialog";
        this._elementIdDialog = "view-facility-dialog";
        this._elementIdFacilityHeader = "facility-header-window";
        this._elementIdFacilityInfo = "facility-info-window";
        this._elementIdGeneratorList = "generator-list-window"
        this._elementIdFacilityFooter = "facility-footer-window";

        this._company = null;
        this._facility = null;
        this._generators = null;
        this._generatorTypes = null;
        this._facilityType = null;
        this._powerTypes = null;
        this._resourceTypes = null;

        // Event listener IDs

        // HTML for dialog
        this._facilityViewWindowHtml = "";
        this._facilityViewHeaderHtml = "";
        this._facilityViewFacilityInfoHtml = "";
        this._facilityViewGeneratorListHtml = "";
        this._facilityViewFooterHtml = "";


        // Load all needed data.
        this._modelData = new ModelData();
        this._modelData.getPlayerFacility(facilityId).then((data) => {
          console.log("data = ", data);
          this._company = data['company'];
          this._facility = data['facility'];
          this._generators = data['generators'];
          this._facilityType = data['facility_type'];
          this._generatorTypes = data['generator_types'];
          this._powerTypes = data['power_types'];
          this._resourceTypes = data['resource_types'];
          this._modelsLoaded = true;
          this._initialize();
          this._initWindow();
          this._createEvents();
          return this.openDialog();
        });
      }

      _initialize() {
        // Add extra property to facility type object.
        this._facilityType["simpletype"] = this._facilityType.maintype.split(" ")[0];
        this._facility["new_facility"] = this._facility.state == "new" ? true : false;
        this._facility["company_name"] = this._company.name;


        // Add PowerType and Resource Type record to each generatorType record.
        this._generatorTypes = this._generatorTypes.map(gt => {
          let powerType = this._powerTypes.find(pt => gt.power_type === pt.id)
          let resType = this._resourceTypes.find(rt => gt.resource_type === rt.id)
          gt['pt'] = powerType;
          gt['rt'] = resType;
          return gt;
        });

        // Add Generator Type record to each Generator record. And check if it's a new generator
        this._generators = this._generators.map(g => {
          g['new_generator'] = g.state == "new" ? true : false;
          let gentype = this._generatorTypes.find(gt => g.generator_type === gt.id)
          g['gentype_details'] = gentype;
          return g;
        });

        // Add total nameplace capacity to facility object.
        this._facility['total_capacity'] = this._generators.reduce(((g_total, g_curr) => { return g_total + g_curr.gentype_details.nameplate_capacity }), 0);

        console.log('this._generators = ', this._generators);
        console.log("this._facility = ", this._facility)
      }

      _initWindow() {
        // Register Handlebars help that formats floats into currency
        Handlebars.registerHelper('formatCurrency', function (value) {
          return value.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
          //return value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        });

        let compiledTemplate = Handlebars.compile(FacilityViewTmplt.facilityView);
        this._facilityViewWindowHtml = $(compiledTemplate());
        $(this._elementIdAnchor).empty();

        this._createHeader();
        this._createFacilityInfo();
        this._createGeneratorList();
        this._createFooter();
      }

      _createHeader() {
        let compiledTemplate = Handlebars.compile(FacilityViewTmplt.facilityViewHeader);
        let templateParms = {
          facilityName: this._facility.name,
          simpleType: this._facilityType.simpletype
        }

        this._facilityViewHeaderHtml = this._addHtml($(compiledTemplate(templateParms)), this._elementIdFacilityHeader, this._facilityViewWindowHtml);
      }

      _createFacilityInfo() {
        let compiledTemplate = Handlebars.compile(FacilityViewTmplt.facilityViewInfo);
        let templateParms = {
          facilityType: this._facilityType,
          facility: this._facility,
          company: this._company,
          numGenerators: this._generators.length,
          nameplaceCap: 1000
        }

        this._facilityViewFacilityInfoHtml = this._addHtml($(compiledTemplate(templateParms)), this._elementIdFacilityInfo, this._facilityViewWindowHtml);
      }

      _createGeneratorList() {
        let compiledTemplate = Handlebars.compile(FacilityViewTmplt.generatorViewList);
        let templateParms = {
          generators: this._generators,
          facility: this._facility
        }

        this._facilityViewGeneratorListHtml = this._addHtml($(compiledTemplate(templateParms)), this._elementIdGeneratorList, this._facilityViewWindowHtml);
      }

      _createFooter() {
        let compiledTemplate = Handlebars.compile(FacilityViewTmplt.facilityViewFooter);
        let templateParms = {
          applyOn: this._applyButtonOn
        }

        this._facilityViewFooterHtml = this._addHtml($(compiledTemplate(templateParms)), this._elementIdFacilityFooter, this._facilityViewWindowHtml);
      }


      //   // https://stackoverflow.com/questions/15088215/handlebars-js-if-block-helper
      //   Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      //     return ("" + arg1 == "" + arg2) ? options.fn(this) : options.inverse(this);
      //   });

      // _createButtons() {
      //   let compiledTemplate = Handlebars.compile(FacilityBuildTmplt.facilityConfirmButtons);
      //   let templateParms = {
      //     totalCapcity: 0,
      //     totalCost: this._totalFacilityCost,
      //     totalBuildTime: this._facilityDef.buildTime,
      //     lifeExpectancy: this._facilityDef.lifeExpectancy

      //   }
      //   this._facilityBuildButtonsHtml = $(compiledTemplate(templateParms));
      //   this._facilityBuildButtonsHtml = $(this._facilityBuildWindowHtml).find(this._dialogElementId).append(this._facilityBuildButtonsHtml);
      // }

      _createEvents() {
        $("#" + this._elementIdAnchor).off();
        // $("#" + this._anchorElementId).on("click", this._addGeneratorButtonId, this, this._addGenerator);
        // $("#" + this._anchorElementId).on("click", this._removeGeneratorButtonClass, this, this._removeGenerator);
        // $("#" + this._anchorElementId).on("change", this._selectGeneratorTypeClass, this, this._changeGeneratorType);
        // $("#" + this._anchorElementId).on("change", this._selectGeneratorCapacityClass, this, this._changeGeneratorCapacity);

        // $("#" + this._anchorElementId).on("click", this._backToSelectButtonId, this, this._backButton);
        // $("#" + this._anchorElementId).on("click", this._buildFacilityButtonId, this, this._buildButton);
        // $("#" + this._anchorElementId).on("click", this._cancelFacilityButtonId, this, this._cancelButton);
      }

      _addHtml(html, htmlId, windowHtml) {
        return $(windowHtml).find("#" + htmlId).append(html);
      }

      openDialog() {
        $("#" + this._elementIdAnchor).empty();
        $("#" + this._elementIdAnchor).append(this._facilityViewWindowHtml);

        this._dialog = $("#" + this._elementIdAnchor).dialog({
          //dialogClass: this._closeCSS,
          title: this._title,
          width: this._width,
          height: this._height,
          position: this._position,
          modal: this._isModel
        });

        return new Promise(resolve => {
          this._dialog.on("dialogclose", (evt, ui) => {
            this._dialog.off("dialogclose");
            resolve(null);
          });
        })
      }

      closeDialog() {
        $("#" + this._elementIdAnchor).dialog("close");
        if (this._closeEvent) this._closeEvent(this._closeEventData);
      }



      // Listener event functions.



    });
});