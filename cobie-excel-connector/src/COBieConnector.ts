/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as elements from "./dmos/Elements";
import * as relationships from "./dmos/Relationships";
import * as relatedElements from "./dmos/RelatedElements";
import * as path from "path";
import * as pcf from "@itwin/pcf";

const { 
  DefinitionModel, DefinitionPartition, PhysicalModel, PhysicalPartition, SpatialLocationModel, SpatialLocationPartition,
  InformationRecordModel, InformationRecordPartition, GroupModel, GroupInformationPartition, DocumentListModel, DocumentPartition, 
  LinkModel, LinkPartition,
} = pcf.imodeljs_backend;

export class COBieConnector extends pcf.PConnector {
  constructor() {
    super();

    new pcf.PConnectorConfig(this, {
      domainSchemaPaths: [
        path.join(__dirname, "../node_modules/@bentley/aec-units-schema/AecUnits.ecschema.xml"),
        path.join(__dirname, "../node_modules/@bentley/functional-schema/Functional.ecschema.xml"),
        path.join(__dirname, "../node_modules/@bentley/spatial-composition-schema/SpatialComposition.ecschema.xml"),
        path.join(__dirname, "../node_modules/@bentley/building-spatial-schema/BuildingSpatial.ecschema.xml"),
      ],
      dynamicSchema: {
        schemaName: "COBieDynamic",
        schemaAlias: "cd",
      },
      connectorName: "COBieConnector",
      appId: "COBieConnector",
      appVersion: "1.0.0.0",
    });

    const subject1 = new pcf.SubjectNode(this, { key: "cobie-subject-1" });

    const linkModel = new pcf.ModelNode(this, { key: "LinkModel1", subject: subject1, modelClass: LinkModel, partitionClass: LinkPartition });
    const defModel = new pcf.ModelNode(this, { key: "DefinitionModel1", subject: subject1, modelClass: DefinitionModel, partitionClass: DefinitionPartition });
    const phyModel = new pcf.ModelNode(this, { key: "PhysicalModel1", subject: subject1, modelClass: PhysicalModel, partitionClass: PhysicalPartition });
    const sptModel = new pcf.ModelNode(this, { key: "SpatialLocationModel1", subject: subject1, modelClass: SpatialLocationModel, partitionClass: SpatialLocationPartition });
    const infModel = new pcf.ModelNode(this, { key: "InformationRecordModel1", subject: subject1, modelClass: InformationRecordModel, partitionClass: InformationRecordPartition });
    const grpModel = new pcf.ModelNode(this, { key: "GroupModel1", subject: subject1, modelClass: GroupModel, partitionClass: GroupInformationPartition });
    const docModel = new pcf.ModelNode(this, { key: "DocumentListModel1", subject: subject1, modelClass: DocumentListModel, partitionClass: DocumentPartition });

    new pcf.LoaderNode(this, {
      key: "cobie-xlsx-loader",
      model: linkModel,
      loader: new pcf.XLSXLoader({
        format: "xlsx",
        entities: ["Contact", "Facility", "Floor", "Space", "Zone", "Type", "Component", "System", "Spare", "Resource", "Job", "Document", "Attribute"],
        relationships: ["System", "Zone", "Space", "Connection", "Assembly"],
        primaryKeyMap: { Contact: "Email" },
        defaultPrimaryKey: "Name",
      }),
    });

    const facilityCategory = new pcf.ElementNode(this, { key: "FacilityCategory", model: defModel, dmo: elements.FacilityCategory });
    const floorCategory = new pcf.ElementNode(this, { key: "FloorCategory", model: defModel, dmo: elements.FloorCategory });
    const spaceCategory = new pcf.ElementNode(this, { key: "SpaceCategory", model: defModel, dmo: elements.SpaceCategory });

    const facility = new pcf.ElementNode(this, { key: "Facility", model: sptModel, dmo: elements.Facility, category: facilityCategory });
    const space = new pcf.ElementNode(this, { key: "Space", model: sptModel, dmo: elements.Space, category: floorCategory });
    const floor = new pcf.ElementNode(this, { key: "Floor", model: sptModel, dmo: elements.Floor, category: floorCategory });
    const component = new pcf.ElementNode(this, { key: "Component", model: phyModel, dmo: elements.Component, category: spaceCategory });

    const type = new pcf.ElementNode(this, { key: "Type", model: defModel, dmo: elements.Type });
    const zone = new pcf.ElementNode(this, { key: "Zone", model: grpModel, dmo: elements.Zone });
    const system = new pcf.ElementNode(this, { key: "System", model: grpModel, dmo: elements.System });
    const doc = new pcf.ElementNode(this, { key: "COBieDocument", model: docModel, dmo: elements.COBieDocument });
    const assmebly = new pcf.ElementNode(this, { key: "Assebly", model: infModel, dmo: elements.Assembly });
    const attribute = new pcf.ElementNode(this, { key: "Attribute", model: infModel, dmo: elements.Attribute });
    const contact = new pcf.ElementNode(this, { key: "Contact", model: infModel, dmo: elements.Contact });
    const connection = new pcf.ElementNode(this, { key: "Connection", model: infModel, dmo: elements.Connection });
    const resource = new pcf.ElementNode(this, { key: "Resource", model: infModel, dmo: elements.Resource });
    const spare = new pcf.ElementNode(this, { key: "Spare", model: infModel, dmo: elements.Spare });
    const job = new pcf.ElementNode(this, { key: "Job", model: infModel, dmo: elements.Job });
    const issue = new pcf.ElementNode(this, { key: "Issue", model: infModel, dmo: elements.Issue });
    const impact = new pcf.ElementNode(this, { key: "Impact", model: infModel, dmo: elements.Impact });

    new pcf.RelationshipNode(this, {
      key: "ComponentConnectsToComponent",
      dmo: relationships.ComponentConnectsToComponent,
      source: component,
      target: component,
    });

    new pcf.RelationshipNode(this, { 
      key: "ZoneIncludesSpaces",
      dmo: relationships.ZoneIncludesSpaces,
      source: zone,
      target: space,
    });

    new pcf.RelationshipNode(this, { 
      key: "SystemGroupsComponents",
      dmo: relationships.SystemGroupsComponents,
      source: system,
      target: component,
    });

    new pcf.RelatedElementNode(this, { 
      key: "ComponentAssemblesComponents",
      dmo: relatedElements.ComponentAssemblesComponents,
      source: component,
      target: component,
    });

    new pcf.RelatedElementNode(this, { 
      key: "ComponentOwnsType",
      dmo: relatedElements.ComponentOwnsType,
      source: component,
      target: type,
    });

    new pcf.RelatedElementNode(this, { 
      key: "FloorComposesSpaces",
      dmo: relatedElements.FloorComposesSpaces,
      source: floor,
      target: space,
    });
  }
}

export function getBridgeInstance() {
  return new COBieConnector();
}
