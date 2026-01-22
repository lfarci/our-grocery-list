FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY api.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0

WORKDIR /home/site/wwwroot

COPY --from=build /app/publish/ ./
COPY docker-entrypoint.sh /opt/startup/docker-entrypoint.sh
RUN chmod +x /opt/startup/docker-entrypoint.sh

ENTRYPOINT ["/opt/startup/docker-entrypoint.sh"]
