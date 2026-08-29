# MergerManager

MergerManager is a planned .NET MAUI application for repeatable law-firm data
mergers. It will discover data from an initially unknown source DBMS, map and
normalize that data into a versioned staging contract, validate it, and load it
into Aderant Expert through an explicitly controlled target adapter.

The project is currently in its planning phase. Start with:

- [Product architecture](docs/architecture/product-architecture.md)
- [Multi-project and project-file architecture](docs/architecture/project-system.md)
- [Audited data changes and go-live corrections](docs/architecture/audited-data-changes.md)
- [Legacy schema assessment](docs/architecture/legacy-schema-assessment.md)
- [Procedure dependency map](docs/architecture/procedure-dependency-map.md)
- [Backlog and work breakdown](docs/planning/backlog.md)

The core design rule is that source-specific extraction, canonical staging, and
Aderant loading are separate layers. A merger can therefore reuse the same
workflow while replacing only the source adapter and mapping configuration.
