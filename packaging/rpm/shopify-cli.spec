# Generated from shopify-cli-1.0.1.gem by gem2rpm -*- rpm-spec -*-
%define rbname shopify-cli
%define version 0.9.2
%define release 1
%define _rpmdir ./build
%define _target_os linux

Summary: Shopify CLI helps you build Shopify apps faster.
Name: %{rbname}

Version: %{version}
Release: %{release}
Group: Development/Ruby
License: Distributable
URL: https://shopify.github.io/shopify-app-cli
# Make sure the spec template is included in the SRPM
Source0: %{rbname}.spec.in
# Requires: ruby [">= 2.5.0"]
Requires: ruby >= 2.5.0, git >= 2.13, make
BuildArch: noarch
Provides: ruby(Shopify-cli) = %{version}

%description
Shopify CLI helps you build Shopify apps faster. It quickly scaffolds Node.js
and Ruby on Rails embedded apps. It also automates many common tasks in the
development process and lets you quickly add popular features, such as billing
and webhooks.


%prep
%setup -T -c

%build

%pre
gem install shopify-cli -v 0.9.2

%preun
gem uninstall shopify-cli -v 0.9.2

%clean

%files

%changelog
