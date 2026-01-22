# SignalR Emulator (Docker)

This directory packages the Azure SignalR Emulator as a Docker image so local
development can run the emulator without installing the .NET tool on the host.

It uses the `Microsoft.Azure.SignalR.Emulator` .NET tool inside a container and
is referenced by `docker-compose.yml` to provide a local SignalR endpoint for
the API during containerized development and testing.
