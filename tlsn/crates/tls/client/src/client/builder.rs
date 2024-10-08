use crate::{
    anchors,
    builder::{ConfigBuilder, WantsVerifier},
    client::{handy, ClientConfig, ResolvesClientCert},
    error::Error,
    kx::SupportedKxGroup,
    verify::{self, CertificateTransparencyPolicy},
    NoKeyLog,
};
use std::sync::Arc;
use tls_core::{key, suites::SupportedCipherSuite, versions};
use web_time::SystemTime;

impl ConfigBuilder<WantsVerifier> {
    /// Choose how to verify client certificates.
    pub fn with_root_certificates(
        self,
        root_store: anchors::RootCertStore,
    ) -> ConfigBuilder<WantsTransparencyPolicyOrClientCert> {
        ConfigBuilder {
            state: WantsTransparencyPolicyOrClientCert {
                cipher_suites: self.state.cipher_suites,
                kx_groups: self.state.kx_groups,
                versions: self.state.versions,
                root_store,
            },
        }
    }
}

/// A config builder state where the caller needs to supply a certificate transparency policy or
/// client certificate resolver.
///
/// In this state, the caller can optionally enable certificate transparency, or ignore CT and
/// invoke one of the methods related to client certificates (as in the [`WantsClientCert`] state).
///
/// For more information, see the [`ConfigBuilder`] documentation.
pub struct WantsTransparencyPolicyOrClientCert {
    cipher_suites: Vec<SupportedCipherSuite>,
    kx_groups: Vec<&'static SupportedKxGroup>,
    versions: versions::EnabledVersions,
    root_store: anchors::RootCertStore,
}

impl ConfigBuilder<WantsTransparencyPolicyOrClientCert> {
    /// Set Certificate Transparency logs to use for server certificate validation.
    ///
    /// Because Certificate Transparency logs are sharded on a per-year basis and can be trusted or
    /// distrusted relatively quickly, rustls stores a validation deadline. Server certificates will
    /// be validated against the configured CT logs until the deadline expires. After the deadline,
    /// certificates will no longer be validated, and a warning message will be logged. The deadline
    /// may vary depending on how often you deploy builds with updated dependencies.
    pub fn with_certificate_transparency_logs(
        self,
        logs: &'static [&'static sct::Log],
        validation_deadline: SystemTime,
    ) -> ConfigBuilder<WantsClientCert> {
        self.with_logs(Some(CertificateTransparencyPolicy::new(
            logs,
            validation_deadline,
        )))
    }

    /// Sets a single certificate chain and matching private key for use
    /// in client authentication.
    ///
    /// `cert_chain` is a vector of DER-encoded certificates.
    /// `key_der` is a DER-encoded RSA, ECDSA, or Ed25519 private key.
    ///
    /// This function fails if `key_der` is invalid.
    pub fn with_single_cert(
        self,
        cert_chain: Vec<key::Certificate>,
        key_der: key::PrivateKey,
    ) -> Result<ClientConfig, Error> {
        self.with_logs(None).with_single_cert(cert_chain, key_der)
    }

    /// Do not support client auth.
    pub fn with_no_client_auth(self) -> ClientConfig {
        self.with_logs(None)
            .with_client_cert_resolver(Arc::new(handy::FailResolveClientCert {}))
    }

    /// Sets a custom [`ResolvesClientCert`].
    pub fn with_client_cert_resolver(
        self,
        client_auth_cert_resolver: Arc<dyn ResolvesClientCert>,
    ) -> ClientConfig {
        self.with_logs(None)
            .with_client_cert_resolver(client_auth_cert_resolver)
    }

    fn with_logs(
        self,
        ct_policy: Option<CertificateTransparencyPolicy>,
    ) -> ConfigBuilder<WantsClientCert> {
        ConfigBuilder {
            state: WantsClientCert {
                cipher_suites: self.state.cipher_suites,
                kx_groups: self.state.kx_groups,
                versions: self.state.versions,
                verifier: Arc::new(verify::WebPkiVerifier::new(
                    self.state.root_store,
                    ct_policy,
                )),
            },
        }
    }
}

/// A config builder state where the caller needs to supply whether and how to provide a client
/// certificate.
///
/// For more information, see the [`ConfigBuilder`] documentation.
pub struct WantsClientCert {
    cipher_suites: Vec<SupportedCipherSuite>,
    kx_groups: Vec<&'static SupportedKxGroup>,
    versions: versions::EnabledVersions,
    verifier: Arc<dyn verify::ServerCertVerifier>,
}

impl ConfigBuilder<WantsClientCert> {
    /// Sets a single certificate chain and matching private key for use
    /// in client authentication.
    ///
    /// `cert_chain` is a vector of DER-encoded certificates.
    /// `key_der` is a DER-encoded RSA, ECDSA, or Ed25519 private key.
    ///
    /// This function fails if `key_der` is invalid.
    pub fn with_single_cert(
        self,
        cert_chain: Vec<key::Certificate>,
        key_der: key::PrivateKey,
    ) -> Result<ClientConfig, Error> {
        let resolver = handy::AlwaysResolvesClientCert::new(cert_chain, &key_der)?;
        Ok(self.with_client_cert_resolver(Arc::new(resolver)))
    }

    /// Do not support client auth.
    pub fn with_no_client_auth(self) -> ClientConfig {
        self.with_client_cert_resolver(Arc::new(handy::FailResolveClientCert {}))
    }

    /// Sets a custom [`ResolvesClientCert`].
    pub fn with_client_cert_resolver(
        self,
        client_auth_cert_resolver: Arc<dyn ResolvesClientCert>,
    ) -> ClientConfig {
        ClientConfig {
            cipher_suites: self.state.cipher_suites,
            kx_groups: self.state.kx_groups,
            alpn_protocols: Vec::new(),
            session_storage: handy::ClientSessionMemoryCache::new(256),
            max_fragment_size: None,
            client_auth_cert_resolver,
            enable_tickets: true,
            versions: self.state.versions,
            enable_sni: true,
            verifier: self.state.verifier,
            key_log: Arc::new(NoKeyLog {}),
            enable_early_data: false,
        }
    }
}
