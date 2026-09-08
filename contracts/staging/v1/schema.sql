-- MergerManager staging compatibility contract 1.0.0
-- Fresh, explicitly selected empty conversion database only. Not an upgrade migration.
-- Preserves the exported physical interface; no new keys, defaults, or constraints.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE [dbo].[NAMES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [varchar](50) NOT NULL,
    [SOURCE_TYPE] [varchar](2) NULL,
    [NAME_TYPE] [varchar](1) NULL,
    [SORT_BY_NAME] [varchar](30) NULL,
    [DISPLAY_NAME] [varchar](160) NULL,
    [FIRST_NAME] [varchar](20) NULL,
    [MIDDLE_NAME] [varchar](20) NULL,
    [LAST_NAME] [varchar](30) NULL,
    [TEST_NAME_UNO] [int] NULL,
    [PROD_NAME_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[CLIENTS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [NAME_ID] [int] NOT NULL,
    [COMPANY_CODE] [varchar](5) NULL,
    [SOURCE_ID] [varchar](50) NOT NULL,
    [SOURCE_CODE] [varchar](50) NOT NULL,
    [TEST_CLIENT_CODE] [varchar](10) NOT NULL,
    [PROD_CLIENT_CODE] [varchar](10) NOT NULL,
    [CLIENT_NAME] [varchar](40) NULL,
    [CLIENT_INACTIVE] [varchar](1) NULL,
    [CLIENT_STATUS] [varchar](5) NULL,
    [OPEN_DATE] [datetime2](7) NULL,
    [CLOSE_DATE] [datetime2](7) NULL,
    [TEST_NAME_UNO] [int] NULL,
    [PROD_NAME_UNO] [int] NULL,
    [TEST_CLIENT_UNO] [int] NULL,
    [PROD_CLIENT_UNO] [int] NULL,
    [OFFC] [varchar](4) NULL,
    [DEPT] [varchar](4) NULL,
    [PROF] [varchar](4) NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL,
    [SOURCE_SYSTEM] [varchar](50) NULL,
    [TEST_CLIENT_NUMBER] [int] NULL
);
GO

CREATE TABLE [dbo].[ADDRESSES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [NAME_ID] [int] NULL,
    [CLIENT_ID] [int] NULL,
    [COMPANY_CODE] [varchar](30) NOT NULL,
    [SOURCE_ID] [varchar](50) NOT NULL,
    [SOURCE_NAME_ID_OBS] [varchar](50) NULL,
    [SEQUENCE_NO] [int] NULL,
    [ATTENTION] [varchar](60) NULL,
    [ADDRESS1] [varchar](60) NULL,
    [ADDRESS2] [varchar](60) NULL,
    [ADDRESS3] [varchar](60) NULL,
    [ADDRESS4] [varchar](60) NULL,
    [CITY] [varchar](60) NULL,
    [STATE] [varchar](5) NULL,
    [COUNTRY] [varchar](5) NULL,
    [ZIP] [varchar](50) NULL,
    [ADDRESS_TYPE] [varchar](5) NULL,
    [PHONE_NUMBER] [varchar](20) NULL,
    [PHONE_NUMBER2] [varchar](20) NULL,
    [FAX_NUMBER] [varchar](20) NULL,
    [EMAIL_DONOTUSE] [varchar](500) NULL,
    [TEST_NAME_UNO_OBS] [int] NULL,
    [PROD_NAME_UNO_OBS] [int] NULL,
    [TEST_ADDRESS_UNO] [int] NULL,
    [PROD_ADDRESS_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[CONTACTS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [NAME_ID] [int] NOT NULL,
    [CLIENT_ID] [int] NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [varchar](50) NOT NULL,
    [SOURCE_CLIENT_ID_OBS] [varchar](50) NULL,
    [CONTACT_NAME] [varchar](50) NULL,
    [EMAIL] [varchar](120) NULL,
    [TEST_NAME_UNO_OBS] [int] NULL,
    [PROD_NAME_UNO_OBS] [int] NULL,
    [TEST_CONTACT_UNO] [int] NULL,
    [PROD_CONTACT_UNO] [int] NULL,
    [TEST_ADDRESS_UNO] [int] NULL,
    [PROD_ADDRESS_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[MATTERS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [CLIENT_ID] [int] NOT NULL,
    [BILLGRP_ID] [int] NULL,
    [ADDRESS_ID] [int] NULL,
    [COMPANY_CODE] [varchar](5) NULL,
    [SOURCE_ID] [varchar](250) NOT NULL,
    [SOURCE_MATTER_CODE] [varchar](50) NOT NULL,
    [SOURCE_MATT_TYPE_CODE] [varchar](50) NULL,
    [TEST_MATTER_CODE] [varchar](10) NOT NULL,
    [PROD_MATTER_CODE] [varchar](10) NOT NULL,
    [MATT_TYPE_CODE] [varchar](5) NULL,
    [LONG_MATT_NAME] [varchar](250) NULL,
    [MATTER_NAME] [varchar](40) NULL,
    [INACTIVE] [varchar](1) NULL,
    [STATUS_CODE] [varchar](5) NOT NULL,
    [OPEN_DATE] [datetime2](7) NULL,
    [CLOSE_DATE] [datetime2](7) NULL,
    [OFFC] [varchar](4) NULL,
    [DEPT] [varchar](4) NULL,
    [PROF] [varchar](4) NULL,
    [TEST_MATTER_UNO] [int] NULL,
    [PROD_MATTER_UNO] [int] NULL,
    [TEST_COMMENT_TEXT_ID] [int] NULL,
    [PROD_COMMENT_TEXT_ID] [int] NULL,
    [TEST_RESP_EMPL_UNO] [int] NULL,
    [PROD_RESP_EMPL_UNO] [int] NULL,
    [TEST_BILL_EMPL_UNO] [int] NULL,
    [PROD_BILL_EMPL_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL,
    [BILL_EMPL_UNO] [int] NULL,
    [MATTER_NUMBER] [int] NULL,
    [RESP_EMPL_UNO] [int] NULL,
    [TEST_MATTER_OPT_UNO] [int] NULL,
    [PROD_MATTER_OPT_UNO] [int] NULL
);
GO

CREATE TABLE [dbo].[BILLGROUPS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [CLIENT_ID] [int] NULL,
    [CONTACT_ID] [int] NULL,
    [ADDRESS_ID] [int] NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [varchar](50) NULL,
    [BILLGRP_CODE] [varchar](10) NULL,
    [BILL_DELIVERY_METHOD] [varchar](25) NULL,
    [TEST_CLIENT_UNO_OBS] [int] NULL,
    [PROD_CLIENT_UNO_OBS] [int] NULL,
    [TEST_ADDRESS_UNO_OBS] [int] NULL,
    [PROD_ADDRESS_UNO_OBS] [int] NULL,
    [TEST_CONTACT_UNO_OBS] [int] NULL,
    [PROD_CONTACT_UNO_OBS] [int] NULL,
    [TEST_BL_EMPL_UNO] [int] NULL,
    [PROD_BL_EMPL_UNO] [int] NULL,
    [TEST_BILLGRP_UNO] [int] NULL,
    [PROD_BILLGRP_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[ASSIGNMENTS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [CLIENT_ID] [int] NULL,
    [MATTER_ID] [int] NULL,
    [TEST_CLIENT_UNO] [int] NULL,
    [PROD_CLIENT_UNO] [int] NULL,
    [TEST_MATTER_UNO] [int] NULL,
    [PROD_MATTER_UNO] [int] NULL,
    [TEST_EMPL_UNO] [int] NULL,
    [PROD_EMPL_UNO] [int] NULL,
    [SOURCE_EMPLOYEE] [varchar](10) NULL,
    [ASSIGNMENT_CODE] [varchar](5) NULL,
    [ASSIGNMENT_PERCENT] [numeric](10,2) NULL,
    [TEST_ASSIGNMENT_UNO] [int] NULL,
    [PROD_ASSIGNMENT_UNO] [int] NULL,
    [EFF_DATE] [datetime2](7) NULL,
    [BATCH] [int] NOT NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[NOTES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [TXT] [varchar](max) NULL,
    [TEST_TEXT_ID] [int] NULL,
    [PROD_TEXT_ID] [int] NULL,
    [BATCH] [int] NOT NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [CLIENT_ID] [int] NULL,
    [MATTER_ID] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[RATES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [CLIENT_ID] [varchar](255) NULL,
    [MATTER_ID] [varchar](255) NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [varchar](255) NULL,
    [SOURCE_MATTER_ID] [varchar](250) NULL,
    [SOURCE_CLIENT_ID_OBS] [varchar](255) NULL,
    [TEST_MATTER_UNO_OBS] [int] NULL,
    [PROD_MATTER_UNO_OBS] [int] NULL,
    [TEST_CLIENT_UNO_OBS] [int] NULL,
    [PROD_CLIENT_UNO_OBS] [int] NULL,
    [RANK_CODE] [varchar](10) NULL,
    [RATE_LEVEL] [int] NULL,
    [AMOUNT] [numeric](10,2) NULL,
    [OFFC] [varchar](4) NULL,
    [DEPT] [varchar](4) NULL,
    [PROF] [varchar](4) NULL,
    [EFF_DATE] [datetime2](7) NULL,
    [EXP_DATE] [datetime2](7) NULL,
    [TEST_EMPL_UNO] [int] NULL,
    [PROD_EMPL_UNO] [int] NULL,
    [TEST_RATE_UNO] [int] NULL,
    [PROD_RATE_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [PROMOTE] [int] NULL
);
GO

CREATE TABLE [dbo].[VENDORS](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [int] NULL,
    [DISPLAY_NAME] [varchar](160) NULL,
    [FEIN] [varchar](20) NULL,
    [TEN99TYPE] [varchar](4) NULL,
    [ONECHECK] [varchar](1) NULL,
    [PAYMENT_TERM] [varchar](4) NULL,
    [TEST_NAME_UNO] [int] NULL,
    [PROD_NAME_UNO] [int] NULL,
    [TEST_VENDOR_UNO] [int] NULL,
    [PROD_VENDOR_UNO] [int] NULL,
    [TEST_ADDRESS_UNO] [int] NULL,
    [PROD_ADDRESS_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [VENDOR_ID] [char](10) NULL,
    [OFFC] [varchar](4) NULL,
    [PROF] [varchar](4) NULL,
    [DEPT] [varchar](4) NULL,
    [NAME_ID] [int] NULL
);
GO

CREATE TABLE [dbo].[VENDORADDRESSES](
    [ID] [int] IDENTITY(1,1) NOT NULL,
    [VENDOR_SOURCE_ID] [int] NULL,
    [COMPANY_CODE] [varchar](5) NOT NULL,
    [SOURCE_ID] [int] NULL,
    [ADDRESS1] [varchar](60) NULL,
    [ADDRESS2] [varchar](60) NULL,
    [ADDRESS3] [varchar](60) NULL,
    [ADDRESS4] [varchar](60) NULL,
    [CITY] [varchar](60) NULL,
    [STATE] [char](5) NULL,
    [ZIP] [varchar](50) NULL,
    [VENDOR_PHONE] [varchar](20) NULL,
    [TEST_NAME_UNO] [int] NULL,
    [PROD_NAME_UNO] [int] NULL,
    [TEST_ADDRESS_UNO] [int] NULL,
    [PROD_ADDRESS_UNO] [int] NULL,
    [CREATE_DATE] [datetime2](7) NOT NULL,
    [MODIFIED_DATE] [datetime2](7) NOT NULL,
    [BATCH] [int] NULL,
    [COUNTRY_CODE] [varchar](5) NULL,
    [ADDRESS_TYPE] [varchar](5) NULL
);
GO
